import { Container } from "@mui/material";
import StatusMessage from "../atoms/StatusMessage";
import LoadingIndicator from "../atoms/LoadingIndicator";
import BottomNavigator from "../molecules/BottomNavigator";
import VideoDisplay from "../molecules/VideoDisplay";

export default function HomePage({
  statusMessage,
  objectDetector,
  isCameraActive,
  isDetecting,
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
