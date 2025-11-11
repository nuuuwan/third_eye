import { Container, Typography } from "@mui/material";
import StatusMessage from "../atoms/StatusMessage";
import LoadingIndicator from "../atoms/LoadingIndicator";
import ControlButtons from "../molecules/ControlButtons";
import VideoDisplay from "../molecules/VideoDisplay";
import DetectionsList from "../molecules/DetectionsList";

export default function HomePage({
  statusMessage,
  objectDetector,
  isCameraActive,
  isDetecting,
  detections,
  videoRef,
  canvasRef,
  onStartCamera,
  onStopCamera,
  onToggleDetection,
}) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Third Eye - Object Detection
      </Typography>

      <StatusMessage message={statusMessage} />

      <ControlButtons
        isCameraActive={isCameraActive}
        isDetecting={isDetecting}
        objectDetector={objectDetector}
        onStartCamera={onStartCamera}
        onStopCamera={onStopCamera}
        onToggleDetection={onToggleDetection}
      />

      <VideoDisplay
        videoRef={videoRef}
        canvasRef={canvasRef}
        isCameraActive={isCameraActive}
        isDetecting={isDetecting}
      />

      <DetectionsList detections={detections} isCameraActive={isCameraActive} />

      {!objectDetector && (
        <LoadingIndicator message="Loading object detector model..." />
      )}
    </Container>
  );
}
