import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, CardHeader, TextField, Box } from '@mui/material';
import { useState } from 'react';
import { login } from '../../services/auth';

export const LoginPage = () => {
    const navigate = useNavigate();
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        setErrors({}); // Limpa erros anteriores
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        let validationErrors: { username?: string; password?: string } = {};
        if (!username) {
            validationErrors.username = 'O nome de usuário é obrigatório.';
        }
        if (!password) {
            validationErrors.password = 'A senha é obrigatória.';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return; // Não continua para a lógica de login
        }

        login({ username, password })
            .then(() => {
                navigate('/');
            })
            .catch((error) => {
                setErrors({ username: error.message });
            });
        console.log('Formulário enviado com:', { username, password });
    };
    
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: '#f4f4f4'
            }}
        >
            <Card sx={{ p: 4, maxWidth: 400, width: '100%' }}>
                <CardHeader title="Login" sx={{ textAlign: 'center' }} />
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            label="Nome de usuário"
                            name="username"
                            id="username"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            autoComplete='username'
                            autoFocus
                            error={!!errors.username}
                            helperText={errors.username}
                        />
                        <TextField
                            label="Senha"
                            name="password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            margin="normal"
                            id="password"
                            autoComplete="current-password"
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2, mb: 1 }}
                        >
                            Entrar
                        </Button>
                    </Box>
                </CardContent>
            </Card>
            <Button>
                <Link to="/cadastro">Não tem uma conta? Cadastre-se</Link>
            </Button>
        </Box>
    );
}

