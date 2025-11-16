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

interface BracketData {
    top: Record<number, PartidaType[]>;
    bottom: Record<number, PartidaType[]>;
    final: PartidaType | null;
    fases: number[];
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
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

    const [snackbar, setSnackBar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'info' });
    const theme = useTheme();

    const partidasMap = useMemo(() => {
        if (!partidas) return new Map<number, PartidaType>();
        return new Map(partidas.map(p => [p.id, p]));
    }, [partidas]);

    const bracketData = useMemo((): BracketData => {
        const emptyData: BracketData = { top: {}, bottom: {}, final: null, fases: [] };

        if (!partidas || partidas.length === 0 || !partidasMap.size) {
            return emptyData;
        }

        const finalMatch = partidas.find(p => p.proximaPartidaId === null);
        if (!finalMatch) {
            return emptyData;
        }

        // Função recursiva (agora dentro do useMemo)
        const findAllAncestorIds = (matchId: number, map: Map<number, PartidaType>): Set<number> => {
            const ancestors = new Set<number>();
            const matchesToSearch = [matchId];
            
            while (matchesToSearch.length > 0) {
                const currentId = matchesToSearch.pop();
                if (!currentId) continue;
                map.forEach(p => {
                    if (p.proximaPartidaId === currentId) {
                        if (!ancestors.has(p.id)) {
                            ancestors.add(p.id);
                            matchesToSearch.push(p.id);
                        }
                    }
                });
            }
            return ancestors;
        };

        // Encontra as 2 partidas que alimentam a final
        const finalistMatches = partidas
            .filter(p => p.proximaPartidaId === finalMatch.id)
            .sort((a, b) => (a.posicaoNaProximaPartida ?? 0) - (b.posicaoNaProximaPartida ?? 0));
        
        const topFinalist = finalistMatches[0];
        const bottomFinalist = finalistMatches[1];

        const topHalfIds = new Set<number>();
        if (topFinalist) {
            topHalfIds.add(topFinalist.id);
            findAllAncestorIds(topFinalist.id, partidasMap).forEach(id => topHalfIds.add(id));
        }

        const bottomHalfIds = new Set<number>();
        if (bottomFinalist) {
            bottomHalfIds.add(bottomFinalist.id);
            findAllAncestorIds(bottomFinalist.id, partidasMap).forEach(id => bottomHalfIds.add(id));
        }

        const top: Record<number, PartidaType[]> = {};
        const bottom: Record<number, PartidaType[]> = {};
        const fasesSet = new Set<number>();

        for (const partida of partidas) {
            if (partida.id === finalMatch.id) continue;
            fasesSet.add(partida.fase);
            if (topHalfIds.has(partida.id)) {
                if (!top[partida.fase]) top[partida.fase] = [];
                top[partida.fase].push(partida);
            } else if (bottomHalfIds.has(partida.id)) {
                if (!bottom[partida.fase]) bottom[partida.fase] = [];
                bottom[partida.fase].push(partida);
            }
        }
        
        const sortLogic = (a: PartidaType, b: PartidaType) => {
            // 1. Agrupa as partidas pelo 'proximaPartidaId'
            //    Isso garante que partidas que vão para o mesmo lugar fiquem juntas.
            if (a.proximaPartidaId !== b.proximaPartidaId) {
                return (a.proximaPartidaId ?? 0) - (b.proximaPartidaId ?? 0);
            }
            // 2. Se vão para a mesma partida, ordena pela posição (1 ou 2)
            //    Isso garante que o Time A (1) fique acima do Time B (2).
            return (a.posicaoNaProximaPartida ?? 0) - (b.posicaoNaProximaPartida ?? 0);
        };

        // Itera sobre todos os arrays de fase (ex: top[0], top[1]) e os ordena
        for (const fase in top) {
            top[fase].sort(sortLogic);
        }
        // Itera sobre todos os arrays de fase (ex: bottom[0], bottom[1]) e os ordena
        for (const fase in bottom) {
            bottom[fase].sort(sortLogic);
        }
        
        // Agora o código continua como antes
        const fases = Array.from(fasesSet).sort((a, b) => a - b);
        return { top, bottom, final: finalMatch, fases };

    }, [partidas, partidasMap]);

    const fasesReversed = useMemo(() => [...bracketData.fases].reverse(), [bracketData.fases]);

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

                // Buscamos o campeonato e o user primeiro
                const [campeonatoData, userData] = await Promise.all([
                    getCampeonatoById(campeonatoId),
                    getMe()
                ]);
                
                setCampeonato(campeonatoData);
                setCurrentUserId(userData.id);

                try {
                    const partidasData = await getPartidasByCampeonato(campeonatoId);
                    setPartidas(partidasData); // Define como [...] (cheio)
                } catch (partidasError: any) {
                    if (partidasError?.response?.status === 404) {
                        console.warn("Nenhuma partida encontrada (API retornou 404).");
                        setPartidas([]); // Define como [] (vazio)
                    } else {
                        throw partidasError; // Lança para o catch principal
                    }
                }

            } catch (err: any) {
                // O catch principal agora pega erros de getCampeonato, getMe, ou erros 500 de partidas
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

    useLayoutEffect(() => {
        const calculateLines = () => {
            
            console.log("[CALC] calculateLines() iniciada.");

            if (!partidas || !containerRef.current) {
                console.warn("[CALC] WARN: 'partidas' ou 'containerRef' está nulo/vazio.");
                setLines([]);
                return;
            }

            const newLines: LinePath[] = [];
            const containerRect = containerRef.current.getBoundingClientRect();

            const scrollLeft = containerRef.current.scrollLeft;
            const scrollWidth = containerRef.current.scrollWidth;
            const scrollHeight = containerRef.current.scrollHeight;
            setSvgDimensions({ width: scrollWidth, height: scrollHeight });

            if (containerRect.width === 0 || containerRect.height === 0) {
                console.warn("[CALC] WARN: Contêiner tem tamanho zero.");
                return;
            }

            for (const partida of partidas) {
                if (partida.proximaPartidaId === null) continue;

                const startEl = cardRefs.current[partida.id];
                const endEl = cardRefs.current[partida.proximaPartidaId];

                if (!startEl || !endEl) continue;

                const startRect = startEl.getBoundingClientRect();
                const endRect = endEl.getBoundingClientRect();

                let startX, startY, endX, endY, midX;

                // --- LÓGICA DE POSIÇÃO (A FONTE DA VERDADE) ---
                // O fluxo é da esquerda p/ direita?
                const isLeftToRight = startRect.left < endRect.left;

                // Lógica Y (Vertical) - não muda
                startY = startRect.top + startRect.height / 2 - containerRect.top;
                if (partida.posicaoNaProximaPartida === 1) {
                    endY = endRect.top + endRect.height * 0.25 - containerRect.top;
                } else if (partida.posicaoNaProximaPartida === 2) {
                    endY = endRect.top + endRect.height * 0.75 - containerRect.top;
                } else {
                    endY = endRect.top + endRect.height / 2 - containerRect.top;
                }

                // Ao calcular as coordenadas X:
                if (isLeftToRight) {
                startX = startRect.right - containerRect.left + scrollLeft;
                endX = endRect.left - containerRect.left + scrollLeft;
                } else {
                    startX = startRect.left - containerRect.left + scrollLeft;
                    endX = endRect.right - containerRect.left + scrollLeft;
                }
                
                midX = startX + (endX - startX) / 2;
                const d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`;

                newLines.push({
                    id: `line-${partida.id}-to-${partida.proximaPartidaId}`,
                    d: d,
                });
            }
            
            console.log("[CALC] Linhas calculadas (newLines):", newLines);
            setLines(newLines);
        };

        calculateLines();
        
        const resizeObserver = new ResizeObserver(() => {
            calculateLines();
        });

        const container = containerRef.current;
    
        if (container) {
            resizeObserver.observe(container);
            container.addEventListener('scroll', calculateLines);
        }
        
        return () => {
            resizeObserver.disconnect();
            if (container) {
                container.removeEventListener('scroll', calculateLines);
            }
        };

    // ATUALIZE AS DEPENDÊNCIAS! Remova 'bracketHalves'.
    }, [partidas, bracketData]);

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
                            flexDirection: 'row', // O contêiner principal agora é uma LINHA
                            gap: 6,
                            p: 2,
                            overflowX: 'auto',
                            minHeight: 400,
                            justifyContent: 'flex-start', // Alinha as colunas ao início
                            alignItems: 'center', // Alinha as colunas no centro
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
                                width: svgDimensions.width || '100%',
                                height: svgDimensions.height || '100%',
                                pointerEvents: 'none',
                                zIndex: 1,
                                overflow: 'visible',
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
                        {bracketData.fases.map(fase => (
                            <Stack
                                key={`top-${fase}`}
                                spacing={4}
                                sx={{ justifyContent: 'space-around', height: '100%', position: 'relative' }}
                            >
                                <Typography variant="h6" component="h3" textAlign="center" sx={{ mb: 2 }}>
                                    {fase === 0 ? 'Play-in' : `Fase ${fase}`}
                                </Typography>
                                {/* Renderiza apenas as partidas da metade esquerda */}
                                {bracketData.top[fase]?.map(partida => (
                                    <PartidaCard
                                        key={partida.id}
                                        partida={partida}
                                        ref={el => (cardRefs.current[partida.id] = el)}
                                    />
                                ))}
                            </Stack>
                        ))}

                        {bracketData.final && (
                            <Stack
                                key={bracketData.final.id}
                                spacing={4}
                                sx={{ justifyContent: 'center', height: '100%', position: 'relative' }}
                            >
                                <Typography variant="h6" component="h3" textAlign="center" sx={{ mb: 2 }}>
                                    Final
                                </Typography>
                                <PartidaCard
                                    key={bracketData.final.id}
                                    partida={bracketData.final}
                                    ref={el => (cardRefs.current[bracketData.final!.id] = el)}
                                />
                            </Stack>
                        )}

                        {/* Itera sobre as fases em ordem [..., 2, 1, 0] */}
                        {fasesReversed.map(fase => (
                            <Stack
                                key={`bottom-${fase}`}
                                spacing={4}
                                sx={{ justifyContent: 'space-around', height: '100%', position: 'relative' }}
                            >
                                <Typography variant="h6" component="h3" textAlign="center" sx={{ mb: 2 }}>
                                    {fase === 0 ? 'Play-in' : `Fase ${fase}`}
                                </Typography>
                                {/* Renderiza apenas as partidas da metade direita */}
                                {bracketData.bottom[fase]?.map(partida => (
                                    <PartidaCard
                                        key={partida.id}
                                        partida={partida}
                                        ref={el => (cardRefs.current[partida.id] = el)}
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
                        onClick={partidas && partidas.length > 0 ? handleOpenChaveDialog : generateChaveamento}
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
                    {partidas && partidas.length > 0 && (
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