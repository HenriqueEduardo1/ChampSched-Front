import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Grid
} from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { MainToolbar } from '../components/main-toolbar';
// import { getUsers } from '../services/user'; // Importa o serviço
import { getUserById } from '../services/user';
import { createTime } from '../services/time'; // Importa o serviço
import type { UserType } from '../types/user';
import type { CreateTimeData } from '../types/time';

export function AddTimePage() {
    const navigate = useNavigate();

    // --- Estados do Formulário ---
    const [timeName, setTimeName] = useState('');
    const [timeContato, setTimeContato] = useState('');

    // --- Estados da Lógica de Integrantes ---
    const [userIdInput, setUserIdInput] = useState(''); // O valor do TextField
    const [isLookingUp, setIsLookingUp] = useState(false); // Loading do botão "Buscar"
    const [lookupError, setLookupError] = useState<string | null>(null);
    const [selectedIntegrantes, setSelectedIntegrantes] = useState<UserType[]>([]);

    // --- Estados de Controle ---
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLookupUser = async () => {
        const id = Number(userIdInput);
        if (isNaN(id)) {
            setLookupError('ID inválido. Digite apenas números.');
            return;
        }

        if (selectedIntegrantes.some(user => user.id === id)) {
            setLookupError('Este usuário já foi adicionado.');
            return;
        }

        setIsLookingUp(true);
        setLookupError(null);

        try {
            const foundUser = await getUserById(id);

            setSelectedIntegrantes(prev => [...prev, foundUser]);
            setUserIdInput(''); // Limpa o campo de input
        } catch (err) {
            setLookupError(err instanceof Error ? err.message : 'Usuário não encontrado');
        } finally {
            setIsLookingUp(false);
        }
    };

    const handleRemoveIntegrante = (userId: number) => {
        setSelectedIntegrantes(prev => prev.filter(user => user.id !== userId));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        // Validação simples
        if (!timeName) {
            setError('O nome do time é obrigatório.');
            return;
        }

        setIsSaving(true);

        const dataToAPI: CreateTimeData = {
            nome: timeName,
            contato: timeContato || undefined, // Envia 'undefined' se estiver vazio
            integrantesIds: selectedIntegrantes.map(user => user.id), // Envia apenas os IDs
        };

        try {
            await createTime(dataToAPI);
            alert('Time criado com sucesso!');
            navigate('/times'); // Redireciona para a lista de times
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao criar o time');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainToolbar />
            <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Criar Novo Time
                </Typography>

                <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="h6">Detalhes do Time</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nome do Time"
                                name="timeName"
                                value={timeName}
                                onChange={(e) => setTimeName(e.target.value)}
                                required
                                disabled={isSaving}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Contato do Time (Email ou Telefone)"
                                name="timeContato"
                                value={timeContato}
                                onChange={(e) => setTimeContato(e.target.value)}
                                disabled={isSaving}
                            />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6">2. Adicionar Integrantes (MVP)</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Digite o ID do usuário para adicioná-lo ao time.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography gutterBottom>Adicionar por ID de Usuário:</Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                <TextField
                                    fullWidth
                                    label="ID do Usuário"
                                    value={userIdInput}
                                    onChange={(e) => {
                                        setUserIdInput(e.target.value);
                                        setLookupError(null); // Limpa o erro ao digitar
                                    }}
                                    disabled={isSaving || isLookingUp}
                                    error={!!lookupError}
                                    helperText={lookupError}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleLookupUser}
                                    disabled={isLookingUp || !userIdInput}
                                    sx={{ flexShrink: 0, height: '56px' }}
                                >
                                    {isLookingUp ? <CircularProgress size={24} /> : 'Adicionar'}
                                </Button>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <Typography gutterBottom>Integrantes Selecionados ({selectedIntegrantes.length}):</Typography>
                            {selectedIntegrantes.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">Nenhum integrante selecionado.</Typography>
                            ) : (
                                <List dense sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 1 }}>
                                    {selectedIntegrantes.map(user => (
                                        <ListItem key={user.id} secondaryAction={
                                            <IconButton edge="end" color="error" onClick={() => handleRemoveIntegrante(user.id)}>
                                                <RemoveCircleIcon />
                                            </IconButton>
                                        }>
                                            <ListItemText primary={user.nome} secondary={`ID: ${user.id} (${user.contato})`} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                        <Grid item xs={12}>
                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                            )}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                size="large"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Criando Time...' : 'Criar Time'}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}