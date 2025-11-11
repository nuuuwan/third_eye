export default class AppUtils {
  constructor() {
    this.animationFrameId = null;
    this.isRunning = false;
  }

  /**
   * Start the real-time detection loop
   * @param {object} params - Detection parameters
   * @param {HTMLVideoElement} params.video - Video element
   * @param {HTMLCanvasElement} params.canvas - Canvas element
   * @param {object} params.detectionUtils - ObjectDetectionUtils instance
   * @param {object} params.objectDetector - MediaPipe detector instance
   * @param {function} params.onDetections - Callback when detections are found
   * @param {boolean} params.isDetecting - Whether detection should be active
   */
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

      // Only detect if video is playing
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const now = Date.now();

        try {
          // Detect objects in the current video frame
          const detectionResult = detectionUtils.detectForVideo(video, now);

          // Notify caller with detections
          if (onDetections) {
            onDetections(detectionResult.detections);
          }

          // Draw bounding boxes on canvas
          detectionUtils.drawDetections(
            detectionResult.detections,
            canvas,
            video
          );
        } catch (error) {
          console.error("Error in detection loop:", error);
        }
      }

      // Continue the loop
      this.animationFrameId = requestAnimationFrame(detectFrame);
    };

    detectFrame();
  }

  /**
   * Stop the detection loop
   */
  stopDetectionLoop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Check if detection loop is running
   * @returns {boolean}
   */
  isDetectionRunning() {
    return this.isRunning;
  }

  /**
   * Get the current animation frame ID
   * @returns {number|null}
   */
  getAnimationFrameId() {
    return this.animationFrameId;
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    this.stopDetectionLoop();
  }
}
