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
        main: '#d78005ff',
        },
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