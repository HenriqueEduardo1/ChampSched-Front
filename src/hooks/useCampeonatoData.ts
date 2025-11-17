import {useState, useEffect} from 'react';
import type { CampeonatoType } from '../types/campeonato';
import type { PartidaType } from '../types/partida';
import { deleteCampeonato, getCampeonatoById } from '../services/campeonato';
import { getMe } from '../services/auth';
import { deletePartidas, getPartidasByCampeonato } from '../services/partida';
import { createChaveamento } from '../services/chaveamento';

export function useCampeonatoData(campeonatoId: string | undefined) {
    
    const [campeonato, setCampeonato] = useState<CampeonatoType | null>(null);
    const [partidas, setPartidas] = useState<PartidaType[] | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [totalPartidas, setTotalPartidas] = useState<number | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null); // Remover quando autenticação estiver pronta
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!campeonatoId) {
            setError('ID do campeonato não fornecido.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const id = Number(campeonatoId);

                const [campeonatoData, UserData] = await Promise.all([
                    getCampeonatoById(id),
                    getMe() // Remover quando autenticação estiver pronta
                ])

                setCampeonato(campeonatoData);
                setCurrentUserId(UserData.id); // Remover quando autenticação estiver pronta

                try {
                    const partidasData = await getPartidasByCampeonato(id);
                    setPartidas(partidasData);
                } catch (partidasError: any) {
                    if (partidasError?.response?.status === 404) {
                        console.warn('Nenhuma partida encontrada para este campeonato.');
                        setPartidas([]);
                    } else {
                        throw partidasError;
                    }
                }
            } catch (err: any) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados do campeonato.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [campeonatoId]);

    const generateChaveamento = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await createChaveamento(Number(campeonatoId));
            setPartidas(data.partidas);
            setMessage(data.message);
            setTotalPartidas(data.totalPartidas);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao gerar chaveamento.');
        } finally {
            setIsLoading(false);
        }
    };

    const erasePartidas = async () => {
        setIsLoading(true);

        if (!partidas || partidas.length === 0) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await deletePartidas(Number(campeonatoId));
            setPartidas(null);
            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao apagar partidas.');
        } finally {
            setIsLoading(false);
        }
    };

    const deleteCampeonatoAction = async () => {
        setIsLoading(true);
        try {
            setIsLoading(true);
            setError(null);
            await deleteCampeonato(Number(campeonatoId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao apagar campeonato.');
         }
        finally { setIsLoading(false); }
    };

    return {
        campeonato,
        partidas,
        message,
        totalPartidas,
        currentUserId,
        isLoading,
        error,
        generateChaveamento,
        erasePartidas,
        deleteCampeonatoAction,
    };
}