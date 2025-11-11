import { Box } from "@mui/material";

export default function VideoDisplay({
  videoRef,
  canvasRef,
  isCameraActive,
  isDetecting,
}) {
  return (
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
  );
}
