import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingIndicator({ message = "Loading..." }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
      <CircularProgress size={24} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
