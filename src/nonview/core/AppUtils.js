export default class AppUtils {
  constructor() {
    this.animationFrameId = null;
    this.isRunning = false;
  }

  startDetectionLoop({
    video,
    canvas,
    detectionUtils,
    objectDetector,
    onDetections,
    isDetecting,
  }) {
    if (!isDetecting || !video || !objectDetector || !canvas) {
      return;
    }

    this.isRunning = true;

    const detectFrame = () => {
      if (!this.isRunning) {
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const now = Date.now();

        try {
          const detectionResult = detectionUtils.detectForVideo(video, now);

          if (onDetections) {
            onDetections(detectionResult.detections);
          }

          detectionUtils.drawDetections(
            detectionResult.detections,
            canvas,
            video,
          );
        } catch (error) {
          console.error("Error in detection loop:", error);
        }
      }

      this.animationFrameId = requestAnimationFrame(detectFrame);
    };

    detectFrame();
  }

  stopDetectionLoop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  isDetectionRunning() {
    return this.isRunning;
  }

  getAnimationFrameId() {
    return this.animationFrameId;
  }

  cleanup() {
    this.stopDetectionLoop();
  }
}
