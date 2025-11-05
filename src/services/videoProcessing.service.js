const fs = require('fs');
const { randomUUID } = require('crypto');
const { prisma } = require('../config/prisma');
const { logger } = require('../utils/logger');
const { ApplicationError } = require('../utils/errors');
const { extractFrames, cleanupFrames } = require('./frameExtractor');
const { recognizeFrame } = require('./ocr.service');
const { extractBookTitleCandidates } = require('./titleExtractor');

const PROCESSING_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

class VideoProcessingService {
  constructor(dependencies = {}) {
    this.prisma = dependencies.prisma || prisma;
    this.frameExtractor = dependencies.frameExtractor || extractFrames;
    this.ocrService = dependencies.ocrService || recognizeFrame;
    this.titleExtractor = dependencies.titleExtractor || extractBookTitleCandidates;
  }

  async createProcessingJob(file) {
    if (!file) {
      throw new ApplicationError('動画ファイルが見つかりません。', {
        status: 400,
        code: 'MISSING_REQUIRED_FIELD',
      });
    }

    const record = await this.prisma.videoProcessing.create({
      data: {
        id: randomUUID(),
        filename: file.originalname,
        filepath: file.path,
        filesize: file.size,
        mimeType: file.mimetype,
        status: PROCESSING_STATUS.PENDING,
        frameCount: 0,
        processedFrames: 0,
      },
    });

    setImmediate(() => {
      this.processVideo(record.id).catch((error) => {
        logger.error('Video processing failed', {
          jobId: record.id,
          error: error.message,
        });
      });
    });

    return record;
  }

  async processVideo(id) {
    const job = await this.prisma.videoProcessing.findUnique({ where: { id } });
    if (!job) {
      throw new ApplicationError('指定された動画が見つかりません。', {
        status: 404,
        code: 'VIDEO_NOT_FOUND',
      });
    }

    let frames = [];

    try {
      await this.prisma.videoProcessing.update({
        where: { id },
        data: {
          status: PROCESSING_STATUS.PROCESSING,
          processedFrames: 0,
        },
      });

      frames = await this.frameExtractor(job.filepath);
      await this.prisma.videoProcessing.update({
        where: { id },
        data: { frameCount: frames.length },
      });

      const ocrRecords = [];
      let processedFrames = 0;

      // eslint-disable-next-line no-restricted-syntax
      for (const frame of frames) {
        // eslint-disable-next-line no-await-in-loop
        const ocrPayload = await this.ocrService(frame);
        const candidates = this.titleExtractor(ocrPayload);
        const bestCandidate =
          candidates.length > 0
            ? candidates.reduce((prev, current) =>
                prev.confidence >= current.confidence ? prev : current
              )
            : null;

        if (ocrPayload.text) {
          ocrRecords.push({
            id: randomUUID(),
            videoProcessingId: id,
            frameNumber: frame.frameNumber,
            recognizedText: ocrPayload.text,
            confidenceScore:
              bestCandidate?.confidence ?? ocrPayload.confidence ?? 0,
            boundingBox: bestCandidate?.bbox || null,
            language: bestCandidate?.language || ocrPayload.language || 'unknown',
            isBookTitle: Boolean(bestCandidate),
          });
        }

        processedFrames += 1;
        // eslint-disable-next-line no-await-in-loop
        await this.prisma.videoProcessing.update({
          where: { id },
          data: {
            processedFrames,
            updatedAt: new Date(),
          },
        });
      }

      if (ocrRecords.length > 0) {
        await this.prisma.ocrResult.createMany({
          data: ocrRecords,
        });
      }

      await this.prisma.videoProcessing.update({
        where: { id },
        data: {
          status: PROCESSING_STATUS.COMPLETED,
          processedFrames: frames.length,
          frameCount: frames.length,
        },
      });
    } catch (error) {
      await this.prisma.videoProcessing.update({
        where: { id },
        data: {
          status: PROCESSING_STATUS.FAILED,
          errorMessage: error.message,
        },
      });

      throw error;
    } finally {
      cleanupFrames(frames);
    }
  }

  async getStatus(id) {
    const job = await this.prisma.videoProcessing.findUnique({ where: { id } });
    if (!job) {
      throw new ApplicationError('指定された動画が見つかりません。', {
        status: 404,
        code: 'VIDEO_NOT_FOUND',
      });
    }

    const percentage =
      job.frameCount === 0
        ? 0
        : Math.round((job.processedFrames / job.frameCount) * 100);

    return {
      id: job.id,
      status: job.status,
      progress: {
        frameCount: job.frameCount,
        processedFrames: job.processedFrames,
        percentage,
      },
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  async getResults(id, options = {}) {
    const { minConfidence = 0, limit = 50 } = options;

    const job = await this.prisma.videoProcessing.findUnique({ where: { id } });
    if (!job) {
      throw new ApplicationError('指定された動画が見つかりません。', {
        status: 404,
        code: 'VIDEO_NOT_FOUND',
      });
    }

    const results = await this.prisma.ocrResult.findMany({
      where: {
        videoProcessingId: id,
        confidenceScore: {
          gte: minConfidence,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: limit,
    });

    return {
      videoId: id,
      totalResults: results.length,
      results,
    };
  }

  async deleteJob(id) {
    const job = await this.prisma.videoProcessing.findUnique({ where: { id } });
    if (!job) {
      throw new ApplicationError('指定された動画が見つかりません。', {
        status: 404,
        code: 'VIDEO_NOT_FOUND',
      });
    }

    await this.prisma.ocrResult.deleteMany({
      where: { videoProcessingId: id },
    });

    await this.prisma.videoProcessing.delete({ where: { id } });

    try {
      if (fs.existsSync(job.filepath)) {
        fs.unlinkSync(job.filepath);
      }
    } catch (error) {
      logger.warn('Failed to remove uploaded file during job deletion', {
        jobId: id,
        error: error.message,
      });
    }
  }
}

module.exports = {
  VideoProcessingService,
  PROCESSING_STATUS,
};
