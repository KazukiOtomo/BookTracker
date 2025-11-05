const { VideoProcessingService } = require('../services/videoProcessing.service');

let videoProcessingService = new VideoProcessingService();

const setVideoProcessingService = (service) => {
  videoProcessingService = service;
};

const sanitizeJobResponse = (job) => ({
  id: job.id,
  filename: job.filename,
  status: job.status,
  createdAt: job.createdAt,
  updatedAt: job.updatedAt,
});

const uploadVideo = async (req, res, next) => {
  try {
    const job = await videoProcessingService.createProcessingJob(req.file);
    res.status(202).json({
      success: true,
      data: sanitizeJobResponse(job),
      message: '動画のアップロードが完了しました。処理を開始します。',
    });
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const status = await videoProcessingService.getStatus(req.params.id);
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

const getResults = async (req, res, next) => {
  try {
    const minConfidence = req.query.minConfidence
      ? Number.parseFloat(req.query.minConfidence)
      : 0;
    const limit = req.query.limit ? Number.parseInt(req.query.limit, 10) : 50;

    const results = await videoProcessingService.getResults(req.params.id, {
      minConfidence: Number.isNaN(minConfidence) ? 0 : minConfidence,
      limit: Number.isNaN(limit) ? 50 : limit,
    });

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    await videoProcessingService.deleteJob(req.params.id);
    res.json({
      success: true,
      message: '動画処理ジョブを削除しました。',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadVideo,
  getStatus,
  getResults,
  deleteJob,
  setVideoProcessingService,
};
