import { useNavigate, Link } from "react-router-dom";
import { AppBar, Button, Typography, Toolbar } from "@mui/material";

import LogoutIcon from '@mui/icons-material/Logout';

export const MainToolbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove o token simulado
        localStorage.removeItem('authToken');
        // Redireciona para o login
        navigate('/login');
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <img
                    src="/favicon.png"
                    alt="Logo ChamSched"
                    style={{ height: 40, marginLeft: 16 }}
                />
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1 }} // 'flexGrow: 1' empurra os botões para a direita
                >
                    ChampSched
                </Typography>

                <Button
                    color="inherit"
                    component={Link} // Usa o Link do React Router
                    to="/"
                >
                    Home
                </Button>
                <Button
                    color="inherit"
                    component={Link}
                    to="/campeonatos"
                >
                    Campeonatos
                </Button>
                <Button
                    color="inherit"
                    component={Link}
                    to="/times"
                >
                    Times
                </Button>

                <Button
                    color="inherit"
                    component={Link}
                    to="/perfil"
                >
                    Perfil
                </Button>
                <Button
                    color="inherit"
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                >
                    Sair
                </Button>
            </Toolbar>
        </AppBar>
    );
}
