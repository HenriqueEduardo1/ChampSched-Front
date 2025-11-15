import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AddUserPage } from './pages/AddUserPage';
import { PerfilPage } from './pages/PerfilPage';
import { CampeonatosPage } from './pages/CampeonatosPage';
import { CampeonatoDetailPage } from './pages/CampeonatosPage/CampeonatoDetailPage';
import { TimesPage } from './pages/TimesPage';

import { ProtectedLayout } from './components/ProtectedLayout';
import { AuthProvider } from './contexts/AuthContext';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { TimeDetailPage } from './pages/TimesPage/TimeDetailPage';
import { AddTimePage } from './pages/AddTimePage';
import { ManageCampeonatoPage } from './pages/CampeonatosPage/CampeonatoDetailPage/ManageCampeonatoPage';

const theme = createTheme({
    palette: {
        mode: 'light',
        
        primary: {
            main: '#134686',
        },
        secondary: {
            main: '#d78005',
        },

        /**
         * Vermelho para erros, validações, botões de "deletar".
         */
        error: {
            main: '#d32f2f',
        },
        /**
         * Laranja/Amarelo para avisos e alertas.
         */
        warning: {
            main: '#ed6c02',
        },
        /**
         * Azul claro para caixas de informação.
         */
        info: {
            main: '#0288d1',
        },
        /**
         * Verde para mensagens de sucesso.
         */
        success: {
            main: '#2e7d32',
        },
        
        /**
         * Define as cores de fundo da aplicação.
         */
        background: {
            default: '#f4f6f8', // Um cinza muito claro para o fundo da página
            paper: '#ffffff',   // Branco puro para Cards, Menus, etc.
        },
        
        /**
         * Define as cores padrão do texto.
         */
        text: {
            primary: 'rgba(0, 0, 0, 0.87)', // Cor principal do texto
            secondary: 'rgba(0, 0, 0, 0.6)', // Cor para textos secundários
        }
    },
});

const router = createBrowserRouter([
    // --- Rotas Públicas ---
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/cadastro",
        element: <AddUserPage />
    },
    {
        path: "/campeonatos",
        element: <CampeonatosPage />
    },

    {
        path: "/campeonatos/:id",
        element: <CampeonatoDetailPage />
    },

    // --- Rotas Privadas ---
    {
        element: <ProtectedLayout />,
        
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/perfil",
                element: <PerfilPage />
            },
            {
                path: "/times",
                element: <TimesPage />
            },
            {
                path: "/times/:id",
                element: <TimeDetailPage />
            },
            {
                path: "/times/novo",
                element: <AddTimePage />
            },
            {
                path: "/campeonatos/:id/gerenciar",
                element: <ManageCampeonatoPage />
            },
        ]
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <RouterProvider router={router} />
            </ThemeProvider>
        </AuthProvider>
    </StrictMode>,
)