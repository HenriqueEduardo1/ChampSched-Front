import { useLayoutEffect, useState, useRef } from 'react';
import type { PartidaType } from '../types/partida';

interface LinePath {
    id: string;
    d: string;
}

export function useBracketSVG(
    partidas: PartidaType[] | null,
    cardRefs: React.MutableRefObject<Record<number, HTMLElement | null>>
) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [lines, setLines] = useState<LinePath[]>([]);
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

    useLayoutEffect(() => {
        const calculateLines = () => {
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

                // --- LÓGICA DE POSIÇÃO ---
                // O fluxo é da esquerda p/ direita?
                const isLeftToRight = startRect.left < endRect.left;

                // Lógica Y (Vertical)
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
            
            setLines(newLines);
        };
        
        calculateLines();
        
        const resizeObserver = new ResizeObserver(calculateLines);
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
    }, [partidas, cardRefs]);

    return { containerRef, lines, svgDimensions };
}