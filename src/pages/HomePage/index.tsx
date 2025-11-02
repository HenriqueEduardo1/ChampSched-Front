import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Container,
    Grid,
    Card,
    CardHeader,
    CardContent,
    CardActions,
    Collapse,
    IconButton,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import type { IconButtonProps } from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MainToolbar } from '../../components/main-toolbar';

import { getUserById } from '../../services/user';
import { getTimesByUserId } from '../../services/time';
import { getCampeonatosByOwnerId, getCampeonatosByUserId } from '../../services/campeonato';

import type { UserType } from '../../types/user';
import type { TimeType } from '../../types/time';
import type { CampeonatoType } from '../../types/campeonato';
import { Link } from 'react-router-dom';
import { getMe } from '../../services/auth';

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
    })(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

export function HomePage() {
    const [user, setUser] = useState<UserType | null>(null);
    const [myTeams, setMyTeams] = useState<TimeType[]>([]);
    const [myChampionships, setMyChampionships] = useState<CampeonatoType[]>([]);
    const [myOrganizedChampionships, setMyOrganizedChampionships] = useState<CampeonatoType[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCard, setExpandedCard] = useState<string | false>(false); // Só um card expandido por vez

    const handleExpandClick = (cardName: string) => {
        setExpandedCard(expandedCard === cardName ? false : cardName);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const user = await getMe();

                const [userData, teamsData, championshipsData, organizedData] = await Promise.all([
                    getUserById(user.id),
                    getTimesByUserId(user.id),
                    getCampeonatosByUserId(user.id),
                    getCampeonatosByOwnerId(user.id)
                ]);

                setUser(userData);
                setMyTeams(teamsData);
                setMyChampionships(championshipsData);
                setMyOrganizedChampionships(organizedData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Falha ao carregar o dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Array vazio, roda só ao carregar

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

        return (
            <Grid container spacing={3} sx={{ mt: 2 }}>
                
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardHeader title="Meu Perfil" />
                        <CardContent>
                            <Typography variant="body2">
                                Logado como: <strong>{user?.nome || '...'}</strong>
                            </Typography>
                        </CardContent>
                        <CardActions disableSpacing>
                            <Typography sx={{ ml: 1 }} variant="caption">Ver detalhes</Typography>
                            <ExpandMore
                                expand={expandedCard === 'profile'}
                                onClick={() => handleExpandClick('profile')}
                                aria-expanded={expandedCard === 'profile'}
                                aria-label="mostrar mais"
                            >
                                <ExpandMoreIcon />
                            </ExpandMore>
                        </CardActions>
                        <Collapse in={expandedCard === 'profile'} timeout="auto" unmountOnExit>
                            <CardContent>
                                <Typography paragraph><strong>Detalhes:</strong></Typography>
                                <Typography><strong>Contato:</strong> {user?.contato}</Typography>
                            </CardContent>
                        </Collapse>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardHeader title="Meus Times" />
                        <CardContent>
                            <Typography variant="body2">
                                Você participa de <strong>{myTeams.length}</strong> time(s).
                            </Typography>
                        </CardContent>
                        <CardActions disableSpacing>
                            <Typography sx={{ ml: 1 }} variant="caption">Ver times</Typography>
                            <ExpandMore
                                expand={expandedCard === 'teams'}
                                onClick={() => handleExpandClick('teams')}
                                aria-expanded={expandedCard === 'teams'}
                                aria-label="mostrar mais"
                            >
                                <ExpandMoreIcon />
                            </ExpandMore>
                        </CardActions>
                        <Collapse in={expandedCard === 'teams'} timeout="auto" unmountOnExit>
                            <CardContent>
                                <List dense>
                                    {myTeams.length > 0 ? myTeams.map(time => (
                                        <ListItem key={time.id} component={Link} to={`/times/${time.id}`} >
                                            <ListItemText primary={time.nome} secondary={time.contato} />
                                        </ListItem>
                                    )) : (
                                        <Typography variant="body2" color="text.secondary">Nenhum time encontrado.</Typography>
                                    )}
                                </List>
                            </CardContent>
                        </Collapse>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardHeader title="Campeonatos que participo" />
                        <CardContent>
                            <Typography variant="body2">
                                Seus times estão em <strong>{myChampionships.length}</strong> campeonato(s).
                            </Typography>
                        </CardContent>
                        <CardActions disableSpacing>
                            <Typography sx={{ ml: 1 }} variant="caption">Ver campeonatos</Typography>
                            <ExpandMore
                                expand={expandedCard === 'champs'}
                                onClick={() => handleExpandClick('champs')}
                                aria-expanded={expandedCard === 'champs'}
                                aria-label="mostrar mais"
                            >
                                <ExpandMoreIcon />
                            </ExpandMore>
                        </CardActions>
                        <Collapse in={expandedCard === 'champs'} timeout="auto" unmountOnExit>
                            <CardContent>
                                <List dense>
                                    {myChampionships.length > 0 ? myChampionships.map(champ => (
                                        <ListItem key={champ.id} component={Link} to={`/campeonatos/${champ.id}`}>
                                            <ListItemText primary={champ.nome} secondary={champ.esporte} />
                                        </ListItem>
                                    )) : (
                                        <Typography variant="body2" color="text.secondary">Nenhum campeonato encontrado.</Typography>
                                    )}
                                </List>
                            </CardContent>
                        </Collapse>
                    </Card>
                </Grid>

                {myOrganizedChampionships.length > 0 && (
                    <Grid item xs={12} sm={6}>
                        <Card>
                            <CardHeader title="Campeonatos que organizo" />
                            <CardContent>
                                <Typography variant="body2">
                                    Você é organizador de <strong>{myOrganizedChampionships.length}</strong> campeonato(s).
                                </Typography>
                            </CardContent>
                            <CardActions disableSpacing>
                                <Typography sx={{ ml: 1 }} variant="caption">Ver campeonatos</Typography>
                                <ExpandMore
                                    expand={expandedCard === 'mychamps'}
                                    onClick={() => handleExpandClick('mychamps')}
                                    aria-expanded={expandedCard === 'mychamps'}
                                    aria-label="mostrar mais"
                                >
                                    <ExpandMoreIcon />
                                </ExpandMore>
                            </CardActions>
                            <Collapse in={expandedCard === 'mychamps'} timeout="auto" unmountOnExit>
                                <CardContent>
                                    <List dense>
                                        {myOrganizedChampionships.length > 0 ? myOrganizedChampionships.map(champ => (
                                            <ListItem key={champ.id} component={Link} to={`/campeonatos/${champ.id}`}>
                                                <ListItemText primary={champ.nome} secondary={champ.esporte} />
                                            </ListItem>
                                        )) : (
                                            <Typography variant="body2" color="text.secondary">Nenhum campeonato encontrado.</Typography>
                                        )}
                                    </List>
                                </CardContent>
                            </Collapse>
                        </Card>
                    </Grid>
                )}

            </Grid>

        );
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainToolbar />
            <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Bem-vindo ao ChampSched{user ? `, ${user.nome}` : ''}!
                </Typography>
                <Typography variant="body1">
                    Este é seu dashboard. Use os cards abaixo para um resumo rápido ou a barra de navegação para gerenciar o sistema.
                </Typography>
                
                <Divider sx={{ my: 3 }} />

                {renderContent()}
            </Container>
        </Box>
    );
};