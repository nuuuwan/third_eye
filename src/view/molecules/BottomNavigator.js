import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Typography,
} from "@mui/material";
import { Videocam, VideocamOff } from "@mui/icons-material";
import VERSION from "../../nonview/constants/VERSION";

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
      elevation={1}
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
      <Box
        sx={{
          textAlign: "center",
          p: 0,
          m: 0,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          v{VERSION.DATETIME_STR}
        </Typography>
      </Box>
    </Paper>
  );
}
