import { useState, useRef, useEffect, useCallback } from "react";
import CameraUtils from "./nonview/core/CameraUtils";
import ObjectDetectionUtils from "./nonview/core/ObjectDetectionUtils";
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
  const detectionUtilsRef = useRef(new ObjectDetectionUtils());
  const animationFrameRef = useRef(null);

  // Initialize the object detector
  useEffect(() => {
    const initializeDetector = async () => {
      try {
        const detectionUtils = detectionUtilsRef.current;
        const detector = await detectionUtils.initialize({
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

  // Start camera and detection
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
      setStatusMessage("Camera active - detecting objects...");

      // Automatically start detection
      if (objectDetector) {
        setIsDetecting(true);
      }
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
    const detectionUtils = detectionUtilsRef.current;

    // Only detect if video is playing
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      const now = Date.now();

      // Detect objects in the current video frame
      const detectionResult = detectionUtils.detectForVideo(video, now);

      // Update detections state
      setDetections(detectionResult.detections);

      // Draw bounding boxes on canvas
      detectionUtils.drawDetections(detectionResult.detections, canvas, video);
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

  // Cleanup camera and detector on unmount
  useEffect(() => {
    const detectionUtils = detectionUtilsRef.current;
    const cameraUtils = cameraUtilsRef.current;

    return () => {
      // Stop detection loop
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Stop camera
      cameraUtils.stopCamera();

      // Dispose detector
      detectionUtils.dispose();
    };
  }, []);

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
    />
  );
}

export default App;
