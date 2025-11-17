import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";

export function ConfirmationDialog({ open, onClose, onConfirm, title, message, isLoading }:
    { open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; isLoading: boolean }) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary" disabled={isLoading}>
                    Cancelar
                </Button>
                <Button onClick={onConfirm} color="error" disabled={isLoading}>
                    Excluir
                </Button>
            </DialogActions>
        </Dialog>
    );
}