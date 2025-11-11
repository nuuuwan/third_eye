import { useState, useRef, useEffect, useCallback } from "react";
import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";
import CameraUtils from "./nonview/core/CameraUtils";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { Videocam, VideocamOff, PlayArrow, Stop } from "@mui/icons-material";

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Third Eye - Object Detection
      </Typography>

      {statusMessage && (
        <Typography
          variant="body1"
          color="primary"
          fontWeight="bold"
          sx={{ mb: 2 }}
          align="center"
        >
          {statusMessage}
        </Typography>
      )}

      <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "center" }}>
        {!isCameraActive && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Videocam />}
            onClick={startCamera}
          >
            Start Camera
          </Button>
        )}

        {isCameraActive && (
          <>
            <Button
              variant="contained"
              color={isDetecting ? "warning" : "success"}
              size="large"
              startIcon={isDetecting ? <Stop /> : <PlayArrow />}
              onClick={() => setIsDetecting(!isDetecting)}
              disabled={!objectDetector}
            >
              {isDetecting ? "Stop Detection" : "Start Detection"}
            </Button>
            <Button
              variant="contained"
              color="error"
              size="large"
              startIcon={<VideocamOff />}
              onClick={stopCamera}
            >
              Stop Camera
            </Button>
          </>
        )}
      </Box>

      <Box
        sx={{
          position: "relative",
          display: isCameraActive ? "block" : "none",
          width: "100%",
          maxWidth: "800px",
          mx: "auto",
          mb: 3,
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
            border: isDetecting ? "3px solid #4CAF50" : "3px solid #2196F3",
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
      </Box>

      {detections.length > 0 && isCameraActive && (
        <Paper elevation={3} sx={{ p: 3, maxWidth: "800px", mx: "auto" }}>
          <Typography variant="h5" gutterBottom>
            Detected Objects ({detections.length})
          </Typography>
          <List>
            {detections.map((detection, index) => (
              <ListItem key={index} divider={index < detections.length - 1}>
                <ListItemText
                  primary={detection.categories[0].categoryName}
                  secondary={`Confidence: ${Math.round(
                    detection.categories[0].score * 100
                  )}%`}
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    textTransform: "capitalize",
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {!objectDetector && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body1" color="text.secondary">
            Loading object detector model...
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default App;
