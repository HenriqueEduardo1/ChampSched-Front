import { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    CircularProgress,
    Alert,
    Divider,
    Button,
    Stack,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar
} from '@mui/material';
import { MainToolbar } from '../../../../components/main-toolbar';
// import { useAuth } from '../../../../contexts/AuthContext'; // Para quando o login estiver pronto
import type { CampeonatoType } from '../../../../types/campeonato';
import { getMe } from '../../../../services/auth';
import type { PartidaType } from '../../../../types/partida';
import { deletePartidas, getPartidasByCampeonato } from '../../../../services/partida';
import { createChaveamento } from '../../../../services/chaveamento';
import { deleteCampeonato, getCampeonatoById } from '../../../../services/campeonato';
import { PartidaCard } from '../../../../components/PartidaCard';
import { Delete } from '@mui/icons-material';

interface LinePath {
    id: string;
    d: string;
}

export function ManageCampeonatoPage() {
    const { id } = useParams<{ id: string }>(); // ID do Campeonato
    const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Retirar quando o login estiver pronto
    const navigate = useNavigate();

    const [campeonato, setCampeonato] = useState<CampeonatoType | null>(null);
    const [partidas, setPartidas] = useState<PartidaType[] | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [totalPartidas, setTotalPartidas] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [chaveamentoDialog, setChaveamentoDialog] = useState(false);
    const [deleteChaveDialog, setDeleteChaveDialog] = useState(false);

    // Armazena as referências dos elementos DOM de cada card
    const cardRefs = useRef<Record<number, HTMLElement | null>>({});
    // Referência do contêiner principal do chaveamento
    const containerRef = useRef<HTMLDivElement>(null);
    // Estado para armazenar os <path> do SVG
    const [lines, setLines] = useState<LinePath[]>([]);

    const [snackbar, setSnackBar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });
    const theme = useTheme();

    useEffect(() => {
        if (!id) {
            setError("ID do campeonato não fornecido.");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const campeonatoId = Number(id);

                const [campeonatoData, userData] = await Promise.all([
                    getCampeonatoById(campeonatoId),
                    getMe() // Retirar quando o login estiver pronto
                ]);
                
                setCampeonato(campeonatoData);
                setCurrentUserId(userData.id); // Retirar quando o login estiver pronto

                try {
                    const partidasData = await getPartidasByCampeonato(campeonatoId);
                    setPartidas(partidasData);
                } catch (partidasError) {
                    console.warn("Nenhuma partida encontrada para este campeonato.");
                    setPartidas(null); // Garante que 'partidas' esteja nulo/vazio
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados do campeonato');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const generateChaveamento = async () => {
       try {
            setIsLoading(true);
            setError(null);
            const data = await createChaveamento(Number(id));
            setPartidas(data.partidas);
            setMessage(data.message);
            setTotalPartidas(data.totalPartidas);
       } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar chaveamento');
       } finally {
            setIsLoading(false);
       }
    };

    const erasePartidas = async () => {
        setIsLoading(true);
        
        if (!partidas) {
            setSnackBar({ open: true, message: 'Nenhuma partida para deletar.', severity: 'info' });
            setIsLoading(false);
            handleCloseDeleteChaveDialog(); // Fecha o dialog
            return;
        }

        try {
            const response = await deletePartidas(Number(id));
            
            setSnackBar({ open: true, message: response.message ?? '', severity: 'success' });
            
            setPartidas(null);
            setMessage(null);
            setTotalPartidas(null);
            handleCloseDeleteChaveDialog();

        } catch (err) {
            let errorMessage = 'Erro ao deletar partidas';

            if (err && typeof err === 'object' && 'response' in err && err.response &&
                typeof err.response === 'object' && 'data' in err.response && err.response.data &&
                typeof err.response.data === 'object' && 'error' in err.response.data)
            {
                errorMessage = err.response.data.error as string;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            
            setSnackBar({ open: true, message: errorMessage, severity: 'error' });

        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
             setIsLoading(true);
             setError(null);
             await deleteCampeonato(Number(id));
             navigate('/campeonatos'); // Redireciona para a lista de campeonatos após exclusão
        } catch (err) {
             setError(err instanceof Error ? err.message : 'Erro ao excluir campeonato');
        } finally {
             setIsLoading(false);
        }
    };

    const handleOpenChaveDialog = () => {
        setChaveamentoDialog(true);
    };

    const handleCloseChaveDialog = () => {
        setChaveamentoDialog(false);
    };

    const handleOpenDeleteDialog = () => {
        setDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialog(false);
    };

    const handleOpenDeleteChaveDialog = () => {
        setDeleteChaveDialog(true);
    };

    const handleCloseDeleteChaveDialog = () => {
        setDeleteChaveDialog(false);
    };

    const partidasPorFase = useMemo(() => {
        if (!partidas) {
            return {};
        }

        return partidas.reduce((acc, partida) => {
            const fase = partida.fase;
            if (!acc[fase]) {
                acc[fase] = [];
            }
            acc[fase].push(partida);
            return acc;
        }, {} as Record<number, PartidaType[]>);

    }, [partidas]);

    useLayoutEffect(() => {
        // console.log("[EFEITO] useLayoutEffect foi disparado.");
        // console.log("[EFEITO] Partidas:", partidas);

        const calculateLines = () => {
            // console.log("[CALC] calculateLines() iniciada.");
            // console.log("[CALC] containerRef.current:", containerRef.current);
            // console.log("[CALC] cardRefs.current:", cardRefs.current);
            if (!partidas || !containerRef.current) {
                setLines([]); // Limpa as linhas se não houver partidas
                return;
            }

            const newLines: LinePath[] = [];
            const containerRect = containerRef.current.getBoundingClientRect();

            if (containerRect.width === 0 || containerRect.height === 0) {
            return;
            }

            for (const partida of partidas) {

                if (partida.proximaPartidaId === null) {
                    continue;
                }

                const startEl = cardRefs.current[partida.id];
                const endEl = cardRefs.current[partida.proximaPartidaId];

                if (!startEl) {
                    console.error(`[LOOP #${partida.id}] ERRO: Não foi encontrado o elemento (startEl) para Partida #${partida.id}`);
                }
                if (!endEl) {
                    console.error(`[LOOP #${partida.id}] ERRO: Não foi encontrado o elemento (endEl) para a próxima partida #${partida.proximaPartidaId}`);
                }

                if (!startEl || !endEl) {
                    continue; // Pula esta linha
                }

                // Pega as dimensões e posições
                const startRect = startEl.getBoundingClientRect();
                const endRect = endEl.getBoundingClientRect();

                // Calcula coordenadas relativas ao contêiner
                // Ponto de Início: Meio do lado direito do card inicial
                const startX = startRect.right - containerRect.left;
                const startY = startRect.top + startRect.height / 2 - containerRect.top;

                // Ponto Final: Meio do lado esquerdo do card final
                const endX = endRect.left - containerRect.left;
                
                // Ajusta a altura Y do ponto final
                // Se for a posição 1, mira na metade de cima do card
                // Se for a posição 2, mira na metade de baixo
                let endY = endRect.top + endRect.height / 2 - containerRect.top;
                if (partida.posicaoNaProximaPartida === 1) {
                    endY = endRect.top + endRect.height * 0.25 - containerRect.top;
                } else if (partida.posicaoNaProximaPartida === 2) {
                    endY = endRect.top + endRect.height * 0.75 - containerRect.top;
                }

                // Cria o path do SVG (uma curva de Bezier suave)
                const midX = startX + (endX - startX) / 2;

                // M = Mover para (início)
                // L = Linha para
                const d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

                newLines.push({
                    id: `line-${partida.id}-to-${partida.proximaPartidaId}`,
                    d: d,
                });
            }
            setLines(newLines);
        };

        // Calcula as linhas na montagem e quando as partidas mudam
        calculateLines();

        // Adiciona um ResizeObserver para recalcular ao mudar o tamanho
        const resizeObserver = new ResizeObserver(() => {
            calculateLines();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Limpeza: remove o observer
        return () => {
            resizeObserver.disconnect();
        };

    }, [partidas, partidasPorFase]);

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
                <Typography variant="h4" component="h1" gutterBottom>
                    Gerenciar: {campeonato.nome}
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom>
                    Partidas
                </Typography>
                    <Box
                        ref={containerRef}
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 8, // Espaço entre as colunas (fases)
                            p: 2,
                            overflow: 'auto',
                            minHeight: 300,
                            justifyContent: 'center',
                            backgroundColor: theme.palette.grey[50],
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            position: 'relative',
                        }}
                    >
                        <Box
                            component="svg"
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none', // Deixa os cliques "atravessarem"
                                zIndex: 1,
                            }}
                        >
                            <g strokeLinejoin="round" strokeLinecap="round">
                                {lines.map(line => (
                                    <path
                                        key={line.id}
                                        d={line.d}
                                        stroke={theme.palette.primary.main}
                                        strokeWidth={3}
                                        fill="none"
                                    />
                                ))}
                            </g>
                        </Box>
                        {Object.keys(partidasPorFase).sort((a, b) => Number(a) - Number(b)).map(fase => (
                            <Stack
                                key={fase}
                                spacing={4}
                                sx={{
                                    justifyContent: 'center', // Centraliza as partidas na coluna
                                    minHeight: '100%', // Garante que a coluna ocupe a altura
                                    position: 'relative',
                                    zIndex: 2, // Garante que os cards fiquem acima das linhas SVG
                                }}
                            >
                                <Typography variant="h6" component="h3" textAlign="center" sx={{ mb: 2 }}>
                                    {Number(fase) === Object.keys(partidasPorFase).length ? 'Final' : `Fase ${fase}`}
                                </Typography>
                                
                                {partidasPorFase[Number(fase)].map(partida => (
                                    <PartidaCard
                                    key={partida.id}
                                    partida={partida}
                                    ref={el => {
                                        console.log(`[REF] Setando ref para Partida #${partida.id}`, el);
                                        cardRefs.current[partida.id] = el;
                                    }}
                                    />
                                ))}
                            </Stack>
                        ))}
                        {(!partidas || partidas.length === 0) && (
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <Typography variant="body1" color="textSecondary">
                                    Clique em "Gerar Chaveamento" para criar as partidas.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                {message && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        {message}
                    </Alert>
                )}
                {totalPartidas !== null && (
                    <Typography variant="body1" sx={{ mt: 2 }}>
                        Total de partidas: {totalPartidas}
                    </Typography>
                )}
                <Divider sx={{ my: 4 }} />
                <Stack spacing={4} direction="row">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={partidas ? handleOpenChaveDialog : generateChaveamento}
                    >
                        Gerar Chaveamento
                    </Button>
                    <Button
                    variant='contained'
                    onClick={() => navigate(-1)}
                    >
                        Voltar
                    </Button>
                    <Button
                        variant="outlined"
                        endIcon={<Delete />}
                        color="error"
                        onClick={handleOpenDeleteDialog}
                    >
                        Excluir Campeonato
                    </Button>
                    {partidas && (
                        <Button
                            variant='outlined'
                            color='error'
                            onClick={handleOpenDeleteChaveDialog}
                            endIcon={<Delete />}
                        >
                            Apagar Partidas
                        </Button>
                    )}
                </Stack>
            </Container>
            <Dialog open={chaveamentoDialog} onClose={handleCloseChaveDialog}>
                <DialogTitle>Chaveamento já gerado</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        O chaveamento já foi gerado para este campeonato.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseChaveDialog} color="primary">
                        Fechar
                    </Button>
                </DialogActions>

            </Dialog>
            <Dialog open={deleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza de que deseja excluir este campeonato? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary" disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDelete} color="error" disabled={isLoading}>
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={deleteChaveDialog} onClose={handleCloseDeleteChaveDialog}>
                <DialogTitle>Confirmar Exclusão das Partidas</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza de que deseja excluir todas as partidas deste campeonato? Esta ação não pode ser desfeita.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteChaveDialog} color="primary" disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button onClick={erasePartidas} color="error" disabled={isLoading}>
                        Excluir Partidas
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackBar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={() => setSnackBar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}