import { useState, useRef, useEffect, useCallback } from "react";
import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";
import CameraUtils from "./nonview/core/CameraUtils";
import HomePage from "./view/pages/HomePage";

function App() {
  const [detections, setDetections] = useState([]);
  const [objectDetector, setObjectDetector] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraUtilsRef = useRef(new CameraUtils());
  const animationFrameRef = useRef(null);
  const lastDetectionTimeRef = useRef(0);

  // Initialize the object detector
  useEffect(() => {
    const initializeDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );
        const detector = await ObjectDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
          },
          scoreThreshold: 0.5,
          runningMode: "VIDEO",
        });
        setObjectDetector(detector);
      } catch (error) {
        console.error("Error initializing object detector:", error);
      }
    };

    initializeDetector();
  }, []);

  // Start camera
  const startCamera = async () => {
    try {
      setStatusMessage("Requesting camera access...");
      console.log("Requesting camera access...");

      const cameraUtils = cameraUtilsRef.current;
      await cameraUtils.startCamera(videoRef.current, {
        facingMode: "environment",
      });

      console.log("Camera access granted");
      setIsCameraActive(true);
      setDetections([]);
      setStatusMessage("Camera active - ready for detection!");
    } catch (error) {
      console.error("Error accessing camera:", error);
      setStatusMessage("");
      alert(
        "Error accessing camera: " +
          error.message +
          "\n\nPlease make sure you've granted camera permissions."
      );
    }
  };

  // Stop camera
  const stopCamera = () => {
    setIsDetecting(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const cameraUtils = cameraUtilsRef.current;
    cameraUtils.stopCamera();
    setIsCameraActive(false);
    setStatusMessage("");
  };

  // Real-time detection loop
  const detectVideoFrame = useCallback(() => {
    if (
      !isDetecting ||
      !videoRef.current ||
      !objectDetector ||
      !canvasRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Only detect if video is playing
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const now = Date.now();

      try {
        // Detect objects in the current video frame
        const detectionResult = objectDetector.detectForVideo(video, now);

        // Update detections state
        setDetections(detectionResult.detections);

        // Draw bounding boxes on canvas
        drawVideoDetections(detectionResult.detections, canvas, video);

        lastDetectionTimeRef.current = now;
      } catch (error) {
        console.error("Error detecting objects in video:", error);
      }
    }

    // Continue the loop
    animationFrameRef.current = requestAnimationFrame(detectVideoFrame);
  }, [isDetecting, objectDetector]);

  // Start/stop detection when isDetecting changes
  useEffect(() => {
    if (isDetecting) {
      detectVideoFrame();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDetecting, objectDetector, detectVideoFrame]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Draw bounding boxes on canvas (for video)
  const drawVideoDetections = (detections, canvas, video) => {
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
      ctx.font = "18px Arial";
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "#00FF00";
      ctx.fillRect(bbox.originX, bbox.originY - 30, textWidth + 10, 30);

      // Draw label text
      ctx.fillStyle = "#000000";
      ctx.fillText(label, bbox.originX + 5, bbox.originY - 8);
    });
  };

  return (
    <HomePage
      statusMessage={statusMessage}
      objectDetector={objectDetector}
      isCameraActive={isCameraActive}
      isDetecting={isDetecting}
      detections={detections}
      videoRef={videoRef}
      canvasRef={canvasRef}
      onStartCamera={startCamera}
      onStopCamera={stopCamera}
      onToggleDetection={() => setIsDetecting(!isDetecting)}
    />
  );
}

export default App;
