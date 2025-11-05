import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Snackbar,
    Stack
} from '@mui/material';
import type { SelectChangeEvent } from "@mui/material";
import type { CampeonatoType } from '../../../types/campeonato';
import type { TimeType } from '../../../types/time';
import { addTimeToCampeonato, getCampeonatoById, removeTimeFromCampeonato } from '../../../services/campeonato';
import DeleteIcon from '@mui/icons-material/Delete';
import { getMe } from '../../../services/auth';
import { getTimesByUserId } from '../../../services/time';
import { MainToolbar } from '../../../components/main-toolbar';


export function CampeonatoDetailPage() {
    const [campeonato, setCampeonato] = useState<CampeonatoType | null>(null);
    const [myTeams, setMyTeams] = useState<TimeType[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<number | ''>(''); // Estado para o Select
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Retirar quando o login estiver pronto
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const { id } = useParams<{ id: string }>(); // Pega o ID do campeonato da URL
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setError('ID do campeonato não encontrado.');
            setIsLoading(false);
            return;
        }

        const fetchPageData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const campeonatoId = Number(id);

                // Busca o usuário logado
                const user = await getMe(); // Retirar quando o login estiver pronto
                setCurrentUserId(user.id); // Retirar quando o login estiver pronto
                
                // Busca os dados do campeonato e os times do usuário em paralelo
                const [campeonatoData, userTeamsData] = await Promise.all([
                    getCampeonatoById(campeonatoId),
                    getTimesByUserId(user.id)
                ]);

                setCampeonato(campeonatoData);
                setMyTeams(userTeamsData);

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPageData();
    }, [id]);

    // Filtra os times para o dropdown
    // Mostra apenas os times do usuário que ainda não estão no campeonato
    const availableTeamsToJoin = useMemo(() => {
        if (!campeonato || !myTeams) return [];
        
        // Pega os IDs dos times que já estão inscritos
        const participatingTeamIds = new Set(campeonato.times.map(t => t.id));
        
        // Retorna os times do usuário que não estão no Set
        return myTeams.filter(team => !participatingTeamIds.has(team.id));
    }, [campeonato, myTeams]);

    const handleTeamSelectChange = (event: SelectChangeEvent<number>) => {
        setSelectedTeamId(event.target.value as number);
    };

    const handleJoinSubmit = async () => {
        if (!id || !selectedTeamId) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Chama a API para adicionar o time
            const updatedCampeonato = await addTimeToCampeonato(Number(id), selectedTeamId);
            
            // Atualiza o estado local para refletir a mudança
            setCampeonato(updatedCampeonato);
            setSelectedTeamId(''); // Limpa o select
            showSnackbar('Time inscrito com sucesso!', 'success');

        } catch (err) {
            showSnackbar(err instanceof Error ? err.message : 'Erro ao inscrever time', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveTime = async (timeId: number) => {
        if (!id) return;

        setIsDeleting(timeId); // Define o loading para este time específico
        setError(null);

        try {
            // Chama a nova função do serviço
            const updatedCampeonato = await removeTimeFromCampeonato(Number(id), timeId);
            
            // Atualiza o estado local para refletir a mudança
            setCampeonato(updatedCampeonato);
            showSnackbar('Time removido com sucesso!', 'success');

        } catch (err) {
            showSnackbar(err instanceof Error ? err.message : 'Erro ao remover time', 'error');
        } finally {
            setIsDeleting(null); // Limpa o loading
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
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

    const isOrganizer = currentUserId === campeonato.organizador.id; // Mudar quando o login estiver pronto

    return (
        <>
            <MainToolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
                    &larr; Voltar para campeonatos
                </Button>

                <Card>
                    <CardContent>
                        <Typography variant="h4" component="h1" gutterBottom>
                            {campeonato.nome}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                            Esporte: {campeonato.esporte}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                            Data: {new Date(campeonato.data).toLocaleDateString('pt-BR')}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                            Organizador: {campeonato.organizador.nome}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" gutterBottom>
                            Times Inscritos ({campeonato.times.length})
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                            {campeonato.times.length > 0 ? (
                                campeonato.times.map((time) => (
                                    <Chip
                                        key={time.id}
                                        label={time.nome}
                                        variant="outlined"
                                        
                                        onDelete={isOrganizer ? () => handleRemoveTime(time.id) : undefined}
                                        
                                        deleteIcon={isDeleting === time.id ? <CircularProgress size={16} /> : <DeleteIcon />}
                                        
                                        disabled={isDeleting === time.id}
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Nenhum time inscrito ainda.
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Inscrever time
                            </Typography>
                            {availableTeamsToJoin.length > 0 ? (
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <FormControl sx={{ minWidth: 250 }}>
                                        <InputLabel id="team-select-label">Selecione um time</InputLabel>
                                        <Select
                                            labelId="team-select-label"
                                            label="Selecione um time"
                                            value={selectedTeamId}
                                            onChange={handleTeamSelectChange}
                                        >
                                            {availableTeamsToJoin.map((time) => (
                                                <MenuItem key={time.id} value={time.id}>
                                                    {time.nome}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <Button
                                        variant="contained"
                                        onClick={handleJoinSubmit}
                                        // O botão fica desabilitado se nada for selecionado
                                        disabled={!selectedTeamId || isSubmitting}
                                    >
                                        {isSubmitting ? "Inscrevendo..." : "Inscrever Time"}
                                    </Button>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary">
                                    Todos os seus times já estão participando deste campeonato.
                                </Typography>
                            )}
                            <Button
                                variant='contained'
                                color='secondary'
                                onClick={() => navigate(`/campeonatos/${campeonato.id}/manage`)}
                                disabled={!isOrganizer}
                                sx={{maxWidth: 400}}
                            >
                                Gerenciar Campeonato
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}