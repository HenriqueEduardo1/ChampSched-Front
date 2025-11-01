import { useEffect, useState } from 'react';
import { useParams, useNavigate, } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Button,
} from '@mui/material';
import { MainToolbar } from '../../../components/main-toolbar';
import { getTimeById } from '../../../services/time';
import type { TimeType } from '../../../types/time';

export function TimeDetailPage() {
    const [time, setTime] = useState<TimeType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

        const fetchTime = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const data = await getTimeById(timeId); 
                
                setTime(data); // Salva o time (que agora inclui os nomes)

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados do time');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTime();

    }, [id]); // Dependência [id] está correta

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

        const names = time.integrantes && time.integrantes.length > 0
            ? time.integrantes.map(user => user.nome).join(', ')
            : 'Não informado';

        return (
            <Card sx={{ mt: 2 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {time.nome}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Contato: {time.contato || 'Não informado'}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Integrantes: {names || 'Não informado'}
                    </Typography>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainToolbar />
            <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography>
                    {isLoading ? 'Carregando...' : (time?.nome || 'Detalhes')}
                </Typography>
                {renderContent()}
                <Button
                    variant="outlined"
                    onClick={() => navigate(-1)} // Função simples de "Voltar"
                    sx={{ mt: 2 }}
                >
                    Voltar
                </Button>
            </Container>
        </Box>
    );
}