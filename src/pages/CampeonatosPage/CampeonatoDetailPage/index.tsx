import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardActions,
    Grid,
    Button,
} from '@mui/material';
import { MainToolbar } from '../../../components/main-toolbar';
import { getCampeonatosById } from '../../../services/campeonato';
import { getTimeById } from '../../../services/time';
import type { CampeonatoType, TimeResumidoType } from '../../../types/campeonato';
import type { TimeType } from '../../../types/time';

export function CampeonatoDetailPage() {
    const [campeonato, setCampeonato] = useState<CampeonatoType | null>(null);
    const [timesFull, setTimesFull] = useState<TimeType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setError('ID do campeonato não fornecido.');
            setIsLoading(false);
            return;
        }

        const campId = Number(id);
        if (isNaN(campId)) {
            setError('ID inválido.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const camp = await getCampeonatosById(campId);
                setCampeonato(camp);

                const timesPromises = (camp.times || []).map((t: TimeResumidoType) => getTimeById(t.id));
                const full = await Promise.all(timesPromises);
                setTimesFull(full);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar detalhes do campeonato');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const renderTeams = () => {
        if (timesFull.length === 0) {
            return <Typography>Nenhum time cadastrado para este campeonato.</Typography>;
        }

        return (
            <Grid container spacing={2} sx={{ mt: 2 }}>
                {timesFull.map((time) => (
                    <Grid item xs={12} sm={6} md={4} key={time.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{time.nome}</Typography>
                                <Typography color="text.secondary">Contato: {time.contato || 'Não informado'}</Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => navigate(`/times/${time.id}`)}>Ver time</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
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

        if (!campeonato) {
            return <Alert severity="info" sx={{ mt: 2 }}>Campeonato não encontrado.</Alert>;
        }

        return (
            <>
                <Card>
                    <CardContent>
                        <Typography variant="h4" gutterBottom>{campeonato.nome}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">Esporte: {campeonato.esporte}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">Data: {new Date(campeonato.data).toLocaleDateString('pt-BR')}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">Organizador: {campeonato.organizador.nome}</Typography>
                    </CardContent>
                </Card>

                <Typography variant="h5" sx={{ mt: 3 }}>Times participantes</Typography>
                {renderTeams()}
            </>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainToolbar />
            <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isLoading ? 'Carregando...' : 'Detalhes do Campeonato'}
                </Typography>

                {renderContent()}

                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate(-1)}>Voltar</Button>
            </Container>
        </Box>
    );
}
