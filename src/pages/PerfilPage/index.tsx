import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Button,
    TextField,
    Grid,
    CircularProgress,
    Alert,
    FormControlLabel,
    Switch
} from '@mui/material';
import { MainToolbar } from '../../components/main-toolbar';
import { getMe } from '../../services/auth';
// import { updateUser } from '../../services/user';
import type { UserType } from '../../types/user';

export function PerfilPage() {
    const [user, setUser] = useState<UserType | null>(null);
    const [originalUser, setOriginalUser] = useState<UserType | null>(null); 
    const [isEditing, setIsEditing] = useState(false);
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        // Busca os dados do usuário logado ao carregar a página
        const fetchUserData = async () => {
            try {
                setIsLoadingPage(true);
                setError(null);
                
                const userData = await getMe(); // Chama /users/me
                
                setUser(userData);
                setOriginalUser(userData); // Salva uma cópia original
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao buscar dados do perfil');
            } finally {
                setIsLoadingPage(false);
            }
        };

        fetchUserData();
    }, []); // Array vazio, roda só uma vez


    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUser(prevUser => (prevUser ? { ...prevUser, [name]: value } : null));
    };

    const handleCancelEdit = () => {
        setUser(originalUser); // Reverte o estado
        setIsEditing(false);
        setError(null);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setError(null);

        try {
            const { id, ...userDataToUpdate } = user;
            
            //Simulação (remover depois)
            console.log("Simulando atualização:", id, userDataToUpdate);
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // const updatedUser = await updateUser(user.id, userDataToUpdate);
            // setUser(updatedUser);
            // setOriginalUser(updatedUser); // Atualiza a cópia original

            
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao salvar. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };


    if (isLoadingPage) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error && !isSaving) { // Só mostra erro de página se não for erro de 'salvar'
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <MainToolbar />
            <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Meu Perfil
                </Typography>

                {user && (
                    <Box component="form" onSubmit={handleSubmit}>
                        <Card>
                            <CardContent>
                                <Grid container spacing={3}>
                                    
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Nome Completo"
                                            name="nome"
                                            value={user.nome}
                                            onChange={handleChange}
                                            disabled={!isEditing || isSaving}
                                            variant={isEditing ? "outlined" : "filled"}
                                            InputProps={{ readOnly: !isEditing }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Contato"
                                            name="contato"
                                            value={user.contato}
                                            onChange={handleChange}
                                            disabled={!isEditing || isSaving}
                                            variant={isEditing ? "outlined" : "filled"}
                                            InputProps={{ readOnly: !isEditing }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Nome de Usuário"
                                            name="username"
                                            value={user.username}
                                            disabled={true} // Nomes de usuário raramente são mutáveis
                                            variant="filled"
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            name="email"
                                            value={user.email}
                                            disabled={true} // Email geralmente requer verificação para mudar
                                            variant="filled"
                                            InputProps={{ readOnly: true }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={user.organizador}
                                                    name="organizador"
                                                    disabled={true} // Papel não deve ser mudado pelo usuário
                                                />
                                            }
                                            label="Eu sou um organizador"
                                        />
                                    </Grid>

                                </Grid>

                                {error && isSaving && (
                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        {error}
                                    </Alert>
                                )}

                                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                    {isEditing ? (
                                        <>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                disabled={isSaving}
                                            >
                                                {isSaving ? 'Salvando...' : 'Salvar'}
                                            </Button>
                                            <Button 
                                                variant="outlined"
                                                onClick={handleCancelEdit}
                                                disabled={isSaving}
                                            >
                                                Cancelar
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            Editar Perfil
                                        </Button>
                                    )}
                                </Box>

                            </CardContent>
                        </Card>
                    </Box>
                )}
            </Container>
        </Box>
    );
}