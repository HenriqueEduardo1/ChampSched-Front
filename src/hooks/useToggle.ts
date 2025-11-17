import { useState, useCallback } from 'react';

/**
 * Um hook customizado para gerenciar um estado booleano (on/off).
 * @param initialState O valor inicial (default: false)
 * @returns Um array contendo:
 * [0] - O valor booleano atual
 * [1] - Uma função para setar o valor para true (open)
 * [2] - Uma função para setar o valor para false (close)
 * [3] - Uma função para inverter o valor (toggle)
 */
export function useToggle(initialState: boolean = false): [boolean, () => void, () => void, () => void] {
    
    // O estado interno do hook
    const [value, setValue] = useState(initialState);

    // Funções memoizadas para evitar re-renderizações desnecessárias
    // se elas forem passadas como props para componentes filhos.

    // Seta para true
    const open = useCallback(() => setValue(true), []);

    // Seta para false
    const close = useCallback(() => setValue(false), []);
    
    // Inverte o valor (true -> false, false -> true)
    const toggle = useCallback(() => setValue((prev) => !prev), []);

    // Retorna em um array para permitir renomear na desestruturação
    return [value, open, close, toggle];
}