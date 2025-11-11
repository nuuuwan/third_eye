import { Box, Button } from "@mui/material";
import { Videocam, VideocamOff, PlayArrow, Stop } from "@mui/icons-material";

export default function ControlButtons({
  isCameraActive,
  isDetecting,
  objectDetector,
  onStartCamera,
  onStopCamera,
  onToggleDetection,
}) {
  return (
    <Box sx={{ mb: 3, display: "flex", gap: 2, justifyContent: "center" }}>
      {!isCameraActive && (
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<Videocam />}
          onClick={onStartCamera}
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
            onClick={onToggleDetection}
            disabled={!objectDetector}
          >
            {isDetecting ? "Stop Detection" : "Start Detection"}
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={<VideocamOff />}
            onClick={onStopCamera}
          >
            Stop Camera
          </Button>
        </>
      )}
    </Box>
  );
}
