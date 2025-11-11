import { Typography } from "@mui/material";

export default function StatusMessage({ message }) {
  if (!message) return null;

  return (
    <Typography variant="body1" color="primary" sx={{ mb: 2 }} align="center">
      {message}
    </Typography>
  );
}
