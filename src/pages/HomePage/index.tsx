import {
    Typography,
    Box,
    Container
} from '@mui/material';
import { MainToolbar } from '../../components/main-toolbar';

export function HomePage() {

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Barra de Navegação Principal */}
            <MainToolbar />

            {/* Conteúdo Principal da Página */}
            <Container
                component="main"
                maxWidth="lg"
                sx={{ mt: 4, mb: 4 }} // Margens no topo (mt) e embaixo (mb)
            >
                <Typography variant="h4" component="h1" gutterBottom>
                    Bem-vindo ao Painel do ChampSched
                </Typography>
                <Typography variant="body1">
                    Selecione uma das opções na barra de navegação para gerenciar
                    seus campeonatos e times.
                </Typography>
                {/* Aqui você adicionará outros componentes no futuro */}
            </Container>
        </Box>
    );
};
