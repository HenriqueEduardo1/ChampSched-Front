import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    Grid,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Chip,
    OutlinedInput
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { MainToolbar } from '../components/main-toolbar';
import { getUsers } from '../services/user'; // Importa o serviço
import { createTime } from '../services/time'; // Importa o serviço
import type { UserType } from '../types/user';
import type { CreateTimeData } from '../types/time';

export function AddTimePage() {
    const navigate = useNavigate();

    // --- Estados do Formulário ---
    const [timeName, setTimeName] = useState('');
    const [timeContato, setTimeContato] = useState('');

    // --- Estados da Lógica de Integrantes ---
    const [allUsers, setAllUsers] = useState<UserType[]>([]);
    const [selectedIntegrantes, setSelectedIntegrantes] = useState<UserType[]>([]);

    // --- Estados de Controle ---
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setIsLoadingPage(true);
                setError(null);
                const usersData = await getUsers();
                setAllUsers(usersData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Falha ao carregar usuários');
            } finally {
                setIsLoadingPage(false);
            }
        };
        fetchAllUsers();
    }, []);

    // --- Handlers ---
    const handleUsersChange = (event: SelectChangeEvent<number[]>) => {
        const {
            target: { value },
        } = event;

        const selectedIds = value as number[];
        
        const selectedUsers = allUsers.filter(user => selectedIds.includes(user.id));
        setSelectedIntegrantes(selectedUsers);
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

        // Prepara os dados para a API (conforme a documentação)
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

    if (isLoadingPage) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }
    
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
                                label="Contato do Time"
                                name="timeContato"
                                value={timeContato}
                                onChange={(e) => setTimeContato(e.target.value)}
                                disabled={isSaving}
                            />
                        </Grid>

                        <Grid item xs={12}><Divider sx={{ my: 2 }} /></Grid>

                        <Grid item xs={12}>
                            <Typography variant="h6">Integrantes do Time</Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Convide usuários a entrarem no time. Nesta versão, convites serão aceitos instantaneamente.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel id="users-label">Integrantes</InputLabel>
                                <Select
                                    labelId="users-label"
                                    multiple
                                    fullWidth
                                    value={selectedIntegrantes.map(user => user.id)}
                                    onChange={handleUsersChange}
                                    input={<OutlinedInput label="Integrantes" />}
                                    renderValue={(selectedIds) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selectedIds.map((id) => {
                                                const user = allUsers.find(u => u.id === id);
                                                return (
                                                    <Chip key={id} label={user?.nome || `Usuário ${id}`} />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {allUsers.map((user) => (
                                        <MenuItem key={user.id} value={user.id}>
                                            {user.nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
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