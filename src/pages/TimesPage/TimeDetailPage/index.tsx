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
import { getUsers } from '../../../services/user';
import type { UserType } from '../../../types/user';

export function TimeDetailPage() {
    const [time, setTime] = useState<TimeType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allUsers, setAllUsers] = useState<UserType[]>([]);

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
            setIsLoading(false);
            return;
        }

        const fetchTime = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const [timeData, usersData] = await Promise.all([
                    getTimeById(timeId), // Pega o time
                    getUsers()           // Pega TODOS os usuários
                ]); // Chama o serviço
                setTime(timeData);
                setAllUsers(usersData);
                console.log(timeData);
                console.log(usersData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados do time');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTime();

    // Este efeito irá rodar novamente se o 'id' na URL mudar.
    }, [id]);

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

        if (!time || allUsers.length === 0) {
            return <Alert severity="info" sx={{ mt: 2 }}>Time não encontrado.</Alert>;
        }

        const integrantesDoTime = allUsers.filter(user => 
            time.integrantesId.includes(user.id)
        );

        const names = integrantesDoTime.length > 0
            ? integrantesDoTime.map(user => user.nome).join(', ')
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