import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { CadastroPage } from './pages/CadastroPage';
import { PerfilPage } from './pages/PerfilPage';
import { CampeonatosPage } from './pages/CampeonatosPage';
import { TimesPage } from './pages/TimesPage';

import { ProtectedLayout } from './components/ProtectedLayout';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
        main: '#134686',
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
        element: <CadastroPage />
    },
    {
        path: "/campeonatos",
        element: <CampeonatosPage />
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
            }
        ]
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <RouterProvider router={router} />
        </ThemeProvider>
    </StrictMode>,
)