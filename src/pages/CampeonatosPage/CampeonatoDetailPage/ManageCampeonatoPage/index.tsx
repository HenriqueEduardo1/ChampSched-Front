import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Breadcrumbs,
    Link,
    Paper,
    Divider,
    Button
} from '@mui/material';
import { MainToolbar } from '../../../../components/main-toolbar';
// import { useAuth } from '../../../../contexts/AuthContext'; // Para quando o login estiver pronto
import { getCampeonatoById } from '../../../../services/campeonato';
import type { CampeonatoType } from '../../../../types/campeonato';
import { getMe } from '../../../../services/auth';

export function ManageCampeonatoPage() {
    const { id } = useParams<{ id: string }>(); // ID do Campeonato
    const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Retirar quando o login estiver pronto
    const navigate = useNavigate();

    const [campeonato, setCampeonato] = useState<CampeonatoType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("ID do campeonato não fornecido.");
            setIsLoading(false);
            return;
        }

        const fetchCampeonato = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await getCampeonatoById(Number(id));
                setCampeonato(data);
                const user = await getMe(); // Retirar quando o login estiver pronto
                setCurrentUserId(user.id); // Retirar quando o login estiver pronto
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar campeonato');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampeonato();
    }, [id]);

    
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
                
                {/* Navegação (Migalhas de pão) */}
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <Link component={RouterLink} underline="hover" color="inherit" to="/">
                        Home
                    </Link>
                    <Link component={RouterLink} underline="hover" color="inherit" to="/campeonatos">
                        Campeonatos
                    </Link>
                    <Link component={RouterLink} underline="hover" color="inherit" to={`/campeonatos/${id}`}>
                        {campeonato.nome}
                    </Link>
                    <Typography color="text.primary">Gerenciar</Typography>
                </Breadcrumbs>

                <Typography variant="h4" component="h1" gutterBottom>
                    Gerenciar: {campeonato.nome}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h5" component="h2" gutterBottom>
                    Times Inscritos ({campeonato.times.length})
                </Typography>
                <Grid container spacing={2}>
                    {campeonato.times.length > 0 ? (
                        campeonato.times.map((time) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={time.id}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="h6" component="div" noWrap>
                                            {time.nome}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Contato: {time.contato || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Integrantes: {time.integrantesIds.length}
                                        </Typography>
                                    </CardContent>
                                    {/* Ver partidas */}
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography color="text.secondary">Nenhum time inscrito ainda.</Typography>
                        </Grid>
                    )}
                </Grid>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h5" component="h2" gutterBottom>
                    Chaveamento e Partidas
                </Typography>
                <Paper sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, border: '2px dashed #ccc' }}>
                    <Typography variant="h6" color="text.secondary">
                        (Em breve: A ferramenta de criação de chaveamento aparecerá aqui)
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}