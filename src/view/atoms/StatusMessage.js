import { Alert } from "@mui/material";

export default function StatusMessage({ message, severity = "info" }) {
  if (!message) return null;

  return (
    <Alert severity={severity} sx={{ mb: 2 }}>
      {message}
    </Alert>
  );
}
