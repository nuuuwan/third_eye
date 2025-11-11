import { useState, useRef, useEffect } from "react";
import CameraUtils from "./nonview/core/CameraUtils";
import ObjectDetectionUtils from "./nonview/core/ObjectDetectionUtils";
import AppUtils from "./nonview/core/AppUtils";
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
  const appUtilsRef = useRef(new AppUtils());

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

  const stopCamera = () => {
    setIsDetecting(false);

    const appUtils = appUtilsRef.current;
    appUtils.stopDetectionLoop();

    const cameraUtils = cameraUtilsRef.current;
    cameraUtils.stopCamera();
    setIsCameraActive(false);
    setStatusMessage("");
  };

  useEffect(() => {
    const appUtils = appUtilsRef.current;
    const detectionUtils = detectionUtilsRef.current;

    if (
      isDetecting &&
      videoRef.current &&
      canvasRef.current &&
      objectDetector
    ) {
      appUtils.startDetectionLoop({
        video: videoRef.current,
        canvas: canvasRef.current,
        detectionUtils: detectionUtils,
        objectDetector: objectDetector,
        onDetections: (detections) => setDetections(detections),
        isDetecting: isDetecting,
      });
    } else {
      appUtils.stopDetectionLoop();
    }

    return () => {
      appUtils.stopDetectionLoop();
    };
  }, [isDetecting, objectDetector]);

  useEffect(() => {
    const detectionUtils = detectionUtilsRef.current;
    const cameraUtils = cameraUtilsRef.current;
    const appUtils = appUtilsRef.current;

    return () => {
      appUtils.cleanup();
      cameraUtils.stopCamera();
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
