import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";
import DETECTION from "../constants/DETECTION";

export default class ObjectDetectionUtils {
  constructor() {
    this.detector = null;
    this.isInitialized = false;
  }

  async initialize(options = {}) {
    try {
      const defaultOptions = {
        wasmPath: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
        modelPath:
          "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/float16/1/efficientdet_lite2.tflite",
        scoreThreshold: options.scoreThreshold || DETECTION.SCORE_THRESHOLD,
        runningMode: options.runningMode || "VIDEO",
      };

      const vision = await FilesetResolver.forVisionTasks(
        defaultOptions.wasmPath
      );

      this.detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: defaultOptions.modelPath,
        },
        scoreThreshold: defaultOptions.scoreThreshold,
        runningMode: defaultOptions.runningMode,
      });

      this.isInitialized = true;
      return this.detector;
    } catch (error) {
      console.error("Error initializing object detector:", error);
      throw error;
    }
  }

  detectForVideo(video, timestamp) {
    if (!this.detector) {
      throw new Error("Detector not initialized");
    }

    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      return { detections: [] };
    }

    try {
      return this.detector.detectForVideo(video, timestamp);
    } catch (error) {
      console.error("Error detecting objects in video:", error);
      return { detections: [] };
    }
  }

  drawDetections(detections, canvas, video) {
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");

    // Match canvas size to video size
    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each detection
    detections.forEach((detection) => {
      const bbox = detection.boundingBox;

      // Draw bounding box
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 4;
      ctx.strokeRect(bbox.originX, bbox.originY, bbox.width, bbox.height);

      // Draw label background
      const label = `${detection.categories[0].categoryName} (${Math.round(
        detection.categories[0].score * 100
      )}%)`;
      ctx.font = "18px Ubuntu";
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "#00FF00";
      ctx.fillRect(bbox.originX, bbox.originY - 30, textWidth + 10, 30);

      // Draw label text
      ctx.fillStyle = "#000000";
      ctx.fillText(label, bbox.originX + 5, bbox.originY - 8);
    });
  }

  isReady() {
    return this.isInitialized && this.detector !== null;
  }

  getDetector() {
    return this.detector;
  }

  dispose() {
    if (this.detector) {
      this.detector = null;
      this.isInitialized = false;
    }
  }
}
