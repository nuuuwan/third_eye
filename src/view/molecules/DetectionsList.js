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
  );
}
