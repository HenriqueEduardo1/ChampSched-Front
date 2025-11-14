import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Button,
    Stack,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { MainToolbar } from '../../../components/main-toolbar';
import { getTimeById, deleteTime, removeIntegranteFromTime, addIntegranteToTime } from '../../../services/time';
import type { TimeType } from '../../../types/time';
import { Add, Delete } from '@mui/icons-material';
import type { UserType } from '../../../types/user';
import { getUsers } from '../../../services/user';

export function TimeDetailPage() {
    const [time, setTime] = useState<TimeType | null>(null);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [timeDialogOpen, setTimeDialogOpen] = useState(false);
    const [userToRemove, setUserToRemove] = useState<number | null>(null);
    const [isSubmittingRemove, setIsSubmittingRemove] = useState(false);

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState<number | ''>('');
    const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setError("ID do time não fornecido.");
            setIsLoading(false);
            return;
        }

        const timeId = Number(id);
        if (isNaN(timeId)) {
            setError("ID inválido.");
            return;
        }

        const fetchTimeAndUsers = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const [timeData, allUsersData] = await Promise.all([
                    getTimeById(timeId),
                    getUsers() // Busca todos os usuários
                ]);
                
                setTime(timeData);
                setAllUsers(allUsersData); // Salva todos os usuários

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimeAndUsers();

    }, [id]);

    const handleDeleteTime = async () => {
            if (!time) return;

            try {
                setIsLoading(true);
                setError(null);

                await deleteTime(time.id);
                navigate('/times');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao excluir time');
            } finally {
                setIsLoading(false);
            }
        };
        
    const availableUsers = useMemo(() => {
        if (!time) return [];
        const integranteIds = new Set(time.integrantes.map(i => i.id));
        return allUsers.filter(user => !integranteIds.has(user.id));
    }, [time, allUsers]);

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleRemoveIntegrante = async (userId: number) => {
        if (!time) return;

        try {
            setIsSubmittingRemove(true);
            setError(null);

            const updatedTime = await removeIntegranteFromTime(time.id, userId);
            setTime(updatedTime); // Atualiza o estado com o time atualizado
            showSnackbar('Integrante removido com sucesso!', 'success'); // Feedback
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao remover integrante do time');
            showSnackbar(err instanceof Error ? err.message : 'Erro ao remover', 'error'); // Feedback
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenTimeDialog = () => {
        setTimeDialogOpen(true);
    };

    const handleCloseTimeDialog = () => {
        setTimeDialogOpen(false);
    };

    const handleOpenConfirmUserDialog = (userId: number) => {
        setUserToRemove(userId); // Guarda quem deve ser removido
        setUserDialogOpen(true); // Abre o dialog
    };

    const handleCloseUserDialog = () => {
        setUserToRemove(null);
        setUserDialogOpen(false);
    };

    const handleOpenAddDialog = () => {
        setIsAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setIsAddDialogOpen(false);
        setSelectedUserIdToAdd('');
        setError(null);
    };

    const handleAddUserSubmit = async () => {
        if (!time || !selectedUserIdToAdd) return;

        setIsSubmittingAdd(true);
        setError(null);
        try {
            const updatedTime = await addIntegranteToTime(time.id, selectedUserIdToAdd);
            setTime(updatedTime); // Atualiza o time
            showSnackbar('Integrante adicionado com sucesso!', 'success');
            handleCloseAddDialog(); // Fecha o dialog
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao adicionar integrante';
            setError(message); // Mostra o erro dentro do dialog
        } finally {
            setIsSubmittingAdd(false);
        }
    };

    const handleConfirmRemove = async () => {
        if (userToRemove !== null) {
            await handleRemoveIntegrante(userToRemove); // Chama a função de API
        }
        handleCloseUserDialog(); // Fecha o dialog
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
        }

        if (!time) {
            return <Alert severity="info" sx={{ mt: 2 }}>Time não encontrado.</Alert>;
        }

        return (
            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {time.nome}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Contato: {time.contato || 'Não informado'}
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 2 }}>Participantes</Typography>
                    <List>
                        {time.integrantes && time.integrantes.length > 0 ? (
                            time.integrantes.map((user) => (
                                <Box key={user.id}>
                                    <ListItem
                                        // Adiciona o botão de remover
                                        secondaryAction={
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirmUserDialog(user.id)}>
                                                <Delete />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText primary={user.nome} secondary={user.email || undefined} />
                                    </ListItem>
                                    <Divider component="li" />
                                </Box>
                            ))
                        ) : (
                            <ListItem>
                                <ListItemText primary="Nenhum participante registrado" />
                            </ListItem>
                        )}
                    </List>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainToolbar />
            <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isLoading ? 'Carregando...' : 'Detalhes'}
                </Typography>
                {renderContent()}
                <Stack spacing={2} direction="row" sx={{ mt: 2 }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)} // Função simples de "Voltar"
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="contained"
                        endIcon={<Delete />}
                        color="secondary"
                        onClick={handleOpenTimeDialog}
                        
                    >
                        Excluir Time
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleOpenAddDialog}
                        startIcon={<Add />}
                    >
                        Adicionar Integrante
                    </Button>
                </Stack>
            </Container>
            <Dialog
                open={userDialogOpen}
                onClose={handleCloseUserDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirmar Remoção
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja remover este integrante do time?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUserDialog} disabled={isSubmittingRemove}>Cancelar</Button>
                    <Button onClick={handleConfirmRemove} color="error" autoFocus disabled={isSubmittingRemove}>
                        {isSubmittingRemove ? 'Removendo...' : 'Remover'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={isAddDialogOpen} onClose={handleCloseAddDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Adicionar Novo Integrante</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel id="add-user-select-label">Selecionar Usuário</InputLabel>
                        <Select
                            labelId="add-user-select-label"
                            value={selectedUserIdToAdd}
                            label="Selecionar Usuário"
                            onChange={(e) => setSelectedUserIdToAdd(e.target.value as number)}
                        >
                            {availableUsers.length > 0 ? (
                                availableUsers.map(user => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.nome} {user.email ? `(${user.email})` : ''}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>Nenhum usuário disponível</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} disabled={isSubmittingAdd}>Cancelar</Button>
                    <Button onClick={handleAddUserSubmit} variant="contained" disabled={isSubmittingAdd || !selectedUserIdToAdd}>
                        {isSubmittingAdd ? 'Adicionando...' : 'Adicionar'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog
                open={timeDialogOpen}
                onClose={handleCloseTimeDialog}
                aria-labelledby="alert-dialog-title-time"
                aria-describedby="alert-dialog-description-time"
            >
                <DialogTitle id="alert-dialog-title-time">
                    Confirmar Exclusão do Time
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-time">
                        Tem certeza que deseja excluir este time? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseTimeDialog} disabled={isLoading}>Cancelar</Button>
                    <Button onClick={handleDeleteTime} color="error" autoFocus disabled={isLoading}>
                        {isLoading ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(prev => ({ ...prev!, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev!, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}