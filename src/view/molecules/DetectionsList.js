import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function DetectionsList({ detections, isCameraActive }) {
  if (detections.length === 0 || !isCameraActive) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: "800px", mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        Detected Objects ({detections.length})
      </Typography>
      <List>
        {detections.map((detection, index) => (
          <ListItem
            key={index}
            sx={{
              borderBottom:
                index < detections.length - 1
                  ? "1px solid rgba(0, 0, 0, 0.12)"
                  : "none",
            }}
          >
            <ListItemText
              primary={detection.categories[0].categoryName}
              secondary={`Confidence: ${Math.round(
                detection.categories[0].score * 100
              )}%`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
