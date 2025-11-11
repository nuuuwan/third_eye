import { Paper, BottomNavigation, BottomNavigationAction } from "@mui/material";
import { Videocam, VideocamOff } from "@mui/icons-material";

export default function BottomNavigator({
  isCameraActive,
  onStartCamera,
  onStopCamera,
}) {
  const handleChange = (event, newValue) => {
    if (newValue === "start") {
      onStartCamera();
    } else if (newValue === "stop") {
      onStopCamera();
    }
  };

  return (
    <Paper
      sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }}
      elevation={3}
    >
      <BottomNavigation
        showLabels={false}
        value={isCameraActive ? "stop" : "start"}
        onChange={handleChange}
      >
        {!isCameraActive && (
          <BottomNavigationAction
            value="start"
            icon={<Videocam />}
            sx={{
              color: "#4CAF50",
              "&.Mui-selected": {
                color: "#4CAF50",
              },
            }}
          />
        )}
        {isCameraActive && (
          <BottomNavigationAction
            value="stop"
            icon={<VideocamOff />}
            sx={{
              color: "#f44336",
              "&.Mui-selected": {
                color: "#f44336",
              },
            }}
          />
        )}
      </BottomNavigation>
    </Paper>
  );
}
