import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

export default function ConfirmDialog({ open, title, message, onYes, onNo }) {
  return (
    <Dialog open={open} onClose={onNo}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onNo} color="error">
          No
        </Button>
        <Button onClick={onYes} color="primary" variant="contained" autoFocus>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
