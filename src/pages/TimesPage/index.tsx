import { useEffect, useState } from 'react';
import type { TimeType } from '../../types/time';
import { getTimes } from '../../services/time';
import { MainToolbar } from '../../components/main-toolbar';

// Importações do Material-UI para o layout
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress, // Spinner de carregamento
    Alert, // Para exibir erros
    TextField
} from '@mui/material';
import { Link } from 'react-router-dom';

export function TimesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allTimes, setAllTimes] = useState<TimeType[]>([]); 
    const [filteredTimes, setFilteredTimes] = useState<TimeType[]>([]);
    const [timeNameQuery, setTimeNameQuery] = useState<string>('');

    useEffect(() => {
        const fetchTimes = async () => {
            try {
                setIsLoading(true); // Inicia o carregamento
                setError(null); // Limpa erros anteriores
                const data = await getTimes(); // Chama o serviço
                setAllTimes(data);
                setFilteredTimes(data);
            } catch (err) {
                // Se o serviço (handleResponse) lançar um erro, nós o pegamos
                setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido');
            } finally {
                // Garante que o loading termine, mesmo se der erro
                setIsLoading(false);
            }
        };

        fetchTimes(); // Executa a busca
    }, []); // O array vazio [] faz isso rodar apenas uma vez (quando a página carrega)

    useEffect(() => {
        // Começa com a lista mestra
        const filtered = allTimes.filter((time) =>
            time.nome.toLowerCase().includes(timeNameQuery.toLowerCase())
        );
        // Atualiza a lista de EXIBIÇÃO
        setFilteredTimes(filtered);
        
    }, [timeNameQuery, allTimes]);

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

        if (filteredTimes.length === 0) {
            // Se a lista mestra tiver itens, significa que o filtro não encontrou nada
            if (allTimes.length > 0) {
                return (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Nenhum time encontrado para "{timeNameQuery}".
                    </Typography>
                );
            }
            return (
                <Typography variant="body1" sx={{ mt: 2 }}>
                    Nenhum time cadastrado ainda.
                </Typography>
            );
        }

        return (
            <Grid container spacing={3} sx={{ mt: 2 }}>
                {filteredTimes.map((time) => (
                    <Grid item key={time.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="h2" gutterBottom>
                                    {time.nome}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    component={Link}
                                    to={`/times/${time.id}`}
                                >
                                    Ver Detalhes
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainToolbar />
            <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Times
                </Typography>
                <Button
                    variant="contained"
                    component={Link}
                    to="/times/novo"
                >
                    Adicionar Novo Time
                </Button>
                <TextField
                    label="Buscar Time por Nome"
                    variant="outlined"
                    fullWidth
                    sx={{ my: 2 }}
                    value={timeNameQuery}
                    onChange={(e) => setTimeNameQuery(e.target.value)}
                />
                {renderContent()}
            </Container>
        </Box>
    );
}