import { Box, Button } from "@mui/material";
import { Videocam, VideocamOff } from "@mui/icons-material";

export default function ControlButtons({
  isCameraActive,
  onStartCamera,
  onStopCamera,
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
          Start Camera & Detection
        </Button>
      )}

      {isCameraActive && (
        <Button
          variant="contained"
          color="error"
          size="large"
          startIcon={<VideocamOff />}
          onClick={onStopCamera}
        >
          Stop Camera
        </Button>
      )}
    </Box>
  );
}
