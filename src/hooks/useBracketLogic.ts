import { useMemo, useRef } from 'react';
import type { PartidaType } from '../types/partida';

interface BracketData {
    top: Record<number, PartidaType[]>;
    bottom: Record<number, PartidaType[]>;
    final: PartidaType | null;
    fases: number[];
}

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

export function useBracketLogic(partidas: PartidaType[] | null) {
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
    

    const fasesReversed = useMemo(() =>
        [...bracketData.fases].reverse(),
    [bracketData.fases]);

    return { bracketData, fasesReversed, cardRefs: useRef<Record<number, HTMLElement | null>>({}) };
}