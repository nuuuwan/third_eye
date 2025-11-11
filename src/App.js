import { useState, useRef, useEffect, useCallback } from "react";
import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";
import CameraUtils from "./nonview/core/CameraUtils";

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
    <div className="App">
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Third Eye - Object Detection</h1>

        {statusMessage && (
          <p
            style={{
              color: "#2196F3",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            {statusMessage}
          </p>
        )}

        <div style={{ marginBottom: "20px" }}>
          {!isCameraActive && (
            <button
              onClick={startCamera}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "4px",
                marginRight: "10px",
              }}
            >
              Start Camera
            </button>
          )}

          {isCameraActive && (
            <>
              <button
                onClick={() => setIsDetecting(!isDetecting)}
                disabled={!objectDetector}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: !objectDetector ? "not-allowed" : "pointer",
                  backgroundColor: !objectDetector
                    ? "#ccc"
                    : isDetecting
                    ? "#FF9800"
                    : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  marginRight: "10px",
                }}
              >
                {isDetecting ? "Stop Detection" : "Start Detection"}
              </button>
              <button
                onClick={stopCamera}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  cursor: "pointer",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  marginRight: "10px",
                }}
              >
                Stop Camera
              </button>
            </>
          )}
        </div>

        <div
          style={{
            position: "relative",
            display: isCameraActive ? "inline-block" : "none",
            width: "100%",
            maxWidth: "800px",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              minHeight: "400px",
              display: "block",
              backgroundColor: "#000",
              border: isDetecting ? "2px solid #4CAF50" : "2px solid #2196F3",
              borderRadius: "8px",
            }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
        </div>

        {detections.length > 0 && isCameraActive && (
          <div style={{ marginTop: "20px" }}>
            <h2>Detected Objects ({detections.length})</h2>
            <ul style={{ textAlign: "left" }}>
              {detections.map((detection, index) => (
                <li key={index}>
                  <strong>{detection.categories[0].categoryName}</strong> -
                  Confidence: {Math.round(detection.categories[0].score * 100)}%
                </li>
              ))}
            </ul>
          </div>
        )}

        {!objectDetector && (
          <p style={{ marginTop: "20px", color: "#666" }}>
            Loading object detector model...
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
