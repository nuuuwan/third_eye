import { Container, Typography, Box } from "@mui/material";
import StatusMessage from "../atoms/StatusMessage";
import LoadingIndicator from "../atoms/LoadingIndicator";
import BottomNavigator from "../molecules/BottomNavigator";
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
}) {
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4, pb: 10 }}>
        <StatusMessage message={statusMessage} />

        <VideoDisplay
          videoRef={videoRef}
          canvasRef={canvasRef}
          isCameraActive={isCameraActive}
          isDetecting={isDetecting}
        />

        <DetectionsList
          detections={detections}
          isCameraActive={isCameraActive}
        />

        {!objectDetector && (
          <LoadingIndicator message="Loading object detector model..." />
        )}
      </Container>

      <BottomNavigator
        isCameraActive={isCameraActive}
        onStartCamera={onStartCamera}
        onStopCamera={onStopCamera}
      />
    </>
  );
}
