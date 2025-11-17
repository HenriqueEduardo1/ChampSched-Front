import { useBracketSVG } from "../hooks/useBracketSVG";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import type { PartidaType } from "../types/partida";
import { PartidaCard } from "./PartidaCard";

interface BracketData {
    top: Record<number, PartidaType[]>;
    bottom: Record<number, PartidaType[]>;
    final: PartidaType | null;
    fases: number[];
}

export function BracketDisplay({ partidas, bracketData, fasesReversed, cardRefs }: {
    partidas: PartidaType[] | null;
    bracketData: BracketData;
    fasesReversed: number[];
    cardRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
}) {
    const theme = useTheme();
    const { containerRef, lines, svgDimensions } = useBracketSVG(partidas, cardRefs);

    return (
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
    );
}