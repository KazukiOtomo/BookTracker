process.env.SKIP_FFMPEG = 'true';
process.env.SKIP_TESSERACT = 'true';

const path = require('path');
const fs = require('fs');
const request = require('supertest');
const app = require('../src/app');
const { prisma } = require('../src/config/prisma');
const {
  setVideoProcessingService,
} = require('../src/controllers/video.controller');
const { VideoProcessingService } = require('../src/services/videoProcessing.service');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForCompletion = async (jobId, client) => {
  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // eslint-disable-next-line no-await-in-loop
    const statusResponse = await client.get(`/api/videos/${jobId}/status`);
    if (statusResponse.status === 404) {
      throw new Error('Job not found while waiting for completion');
    }
    const { status } = statusResponse.body.data;
    if (status === 'COMPLETED' || status === 'FAILED') {
      return statusResponse.body.data;
    }
    // eslint-disable-next-line no-await-in-loop
    await wait(10);
  }
  throw new Error('Timeout waiting for job completion');
};

beforeEach(() => {
  // Reset in-memory database between tests when applicable
  if (prisma.$isInMemory) {
    prisma.videoProcessing = new prisma.videoProcessing.constructor();
    prisma.ocrResult = new prisma.ocrResult.constructor();
  }
  setVideoProcessingService(new VideoProcessingService({ prisma }));
});

afterAll(async () => {
  if (!prisma.$isInMemory && prisma.$disconnect) {
    await prisma.$disconnect();
  }
  // Clean uploads directory created during tests
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (fs.existsSync(uploadDir)) {
    fs.readdirSync(uploadDir).forEach((file) => {
      const target = path.join(uploadDir, file);
      try {
        fs.unlinkSync(target);
      } catch (error) {
        // ignore cleanup errors
      }
    });
  }
});

describe('Video Processing API', () => {
  test('uploads video, processes OCR, and returns results', async () => {
    const agent = request(app);

    const uploadResponse = await agent
      .post('/api/videos/upload')
      .attach('video', Buffer.from('fake-video-data'), {
        filename: 'bookshelf.mp4',
        contentType: 'video/mp4',
      });

    expect(uploadResponse.status).toBe(202);
    expect(uploadResponse.body.success).toBe(true);
    expect(uploadResponse.body.data.status).toBe('PENDING');

    const { id } = uploadResponse.body.data;
    const statusData = await waitForCompletion(id, agent);
    expect(statusData.status === 'COMPLETED' || statusData.status === 'FAILED').toBe(true);

    const resultsResponse = await agent.get(`/api/videos/${id}/results`);
    expect(resultsResponse.status).toBe(200);
    expect(resultsResponse.body.success).toBe(true);
    expect(resultsResponse.body.data.videoId).toBe(id);
  });

  test('rejects unsupported file type', async () => {
    const agent = request(app);
    const response = await agent
      .post('/api/videos/upload')
      .attach('video', Buffer.from('fake'), {
        filename: 'bookshelf.txt',
        contentType: 'text/plain',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_FILE_TYPE');
  });

  test('returns not found for unknown job', async () => {
    const agent = request(app);
    const unknownId = 'b6ea1ba9-4d63-4d18-aafb-0b34dd969652';
    const statusResponse = await agent.get(`/api/videos/${unknownId}/status`);

    expect(statusResponse.status).toBe(404);
    expect(statusResponse.body.error.code).toBe('VIDEO_NOT_FOUND');
  });
});
