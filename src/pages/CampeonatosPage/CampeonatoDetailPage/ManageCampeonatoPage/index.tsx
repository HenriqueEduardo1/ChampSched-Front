import { useState } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Divider,
    Button,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar
} from '@mui/material';
import { MainToolbar } from '../../../../components/main-toolbar';
// import { useAuth } from '../../../../contexts/AuthContext'; // Para quando o login estiver pronto
import { Delete } from '@mui/icons-material';
import { useCampeonatoData } from '../../../../hooks/useCampeonatoData';
import { ConfirmationDialog } from '../../../../components/ConfirmationDialog';
import { useToggle } from '../../../../hooks/useToggle';
import { useBracketLogic } from '../../../../hooks/useBracketLogic';
import { BracketDisplay } from '../../../../components/BracketDisplay';

export function ManageCampeonatoPage() {
    const { id } = useParams<{ id: string }>(); // ID do Campeonato
    const navigate = useNavigate();
    const [deleteDialog, openDelete, closeDelete] = useToggle();
    const [chaveDialog, openChave, closeChave] = useToggle();
    const [deleteChaveDialog, openDeleteChave, closeDeleteChave] = useToggle();
    
    const {
        campeonato,
        partidas,
        message,
        totalPartidas,
        currentUserId,
        isLoading,
        error,
        generateChaveamento,
        erasePartidas,
        deleteCampeonatoAction
    } = useCampeonatoData(id);
    
    const { bracketData, fasesReversed, cardRefs } = useBracketLogic(partidas);
    const [snackbar, setSnackBar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });

    const handleDelete = async () => {
        await deleteCampeonatoAction();
        navigate('/campeonatos');
    };

    const handleErase = async () => {
        const response = await erasePartidas();
        const message = response?.message ?? 'Partidas apagadas com sucesso.';
        setSnackBar({ open: true, message, severity: 'success' });
        closeDeleteChave();
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }
    if (!campeonato) {
        return <Alert severity="info">Campeonato não encontrado.</Alert>;
    }

    if (currentUserId !== campeonato.organizador.id) {
        return (
            <>
                <MainToolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Alert severity="error">
                        Você não tem permissão para gerenciar este campeonato.
                    </Alert>
                    <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Voltar</Button>
                </Container>
            </>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainToolbar />
            <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Gerenciar: {campeonato.nome}
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                    Partidas
                </Typography>
                <BracketDisplay
                    partidas={partidas}
                    bracketData={bracketData}
                    fasesReversed={fasesReversed}
                    cardRefs={cardRefs}
                />
                {message && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {message}
                    </Alert>
                )}
                {totalPartidas !== null && (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Total de partidas: {totalPartidas}
                    </Typography>
                )}
                <Divider sx={{ my: 4 }} />
                <Stack spacing={4} direction="row">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={partidas && partidas.length > 0 ? openChave : generateChaveamento}
                    >
                        Gerar Chaveamento
                    </Button>
                    <Button
                        variant='contained'
                        onClick={() => navigate(-1)}
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="outlined"
                        endIcon={<Delete />}
                        color="error"
                        // Use 'openDelete' diretamente
                        onClick={openDelete}
                    >
                        Excluir Campeonato
                    </Button>
                    {partidas && partidas.length > 0 && (
                        <Button
                            variant='outlined'
                            color='error'
                            onClick={openDeleteChave}
                            endIcon={<Delete />}
                        >
                            Apagar Partidas
                        </Button>
                    )}
                </Stack>
            </Container>
            <Dialog open={chaveDialog} onClose={closeChave}>
                <DialogTitle>Chaveamento já gerado</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        O chaveamento já foi gerado para este campeonato.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeChave} color="primary">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            <ConfirmationDialog
                open={deleteDialog}
                onClose={closeDelete}
                onConfirm={handleDelete}
                isLoading={isLoading}
                title="Confirmar Exclusão"
                message="Tem certeza de que deseja excluir este campeonato? Esta ação não pode ser desfeita."
            />
            <ConfirmationDialog
                open={deleteChaveDialog}
                onClose={closeDeleteChave}
                onConfirm={handleErase}
                isLoading={isLoading}
                title="Confirmar Exclusão"
                message="Tem certeza de que deseja excluir todas as partidas deste campeonato? Esta ação não pode ser desfeita."
            />
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackBar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackBar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}