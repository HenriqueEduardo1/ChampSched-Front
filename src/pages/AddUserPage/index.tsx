import { Box, Button, Container, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";
import { useNavigate } from 'react-router-dom';
import type { CreateUserData } from '../../types/user';
import { register } from "../../services/auth";

interface ValidationErrorInterface {
    nome?: string;
    username?: string;
    contato?: string;
    email?: string;
    senha?: string;
    confSenha?: string;
    api?: string;
};

interface FormDataInterface {
    nome: string;
    username: string;
    contato: string;
    email: string;
    senha: string;
    confSenha: string;
    isOrganizer?: boolean;
};

export const AddUserPage = () => {
    const [formData, setFormData] = useState<FormDataInterface>({
        nome: '',
        username: '',
        contato: '',
        email: '',
        senha: '',
        confSenha: '',
        isOrganizer: false,
    });
    const [errors, setErrors] = useState<ValidationErrorInterface>({});
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name } = event.target;

        const isCheckbox = event.target.type === 'checkbox';

        const value = isCheckbox ? event.target.checked : event.target.value;
        
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name as keyof ValidationErrorInterface]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Impede o recarregamento da página

        const { nome, username, contato, email, senha, confSenha } = formData;
        const newErrors: ValidationErrorInterface = {};

        // Validação de campos vazios
        if (!nome) newErrors.nome = "O nome é obrigatório.";
        if (!username) newErrors.username = "O nome de usuário é obrigatório.";
        if (!contato) newErrors.contato = "O contato é obrigatório.";
        if (!email) newErrors.email = "O email é obrigatório.";
        if (!senha) newErrors.senha = "A senha é obrigatória.";

        // Validação da confirmação de senha
        if (!confSenha) {
            newErrors.confSenha = "A confirmação da senha é obrigatória.";
        } else if (senha && senha !== confSenha) {
            // Só executa se a senha principal foi preenchida
            newErrors.confSenha = "As senhas não conferem.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        
        const dataToAPI: CreateUserData = {
            nome,
            username,
            contato,
            email,
            senha,
            organizador: formData.isOrganizer || false,
        };

        try {
            await register(dataToAPI);
            alert('Usuário cadastrado');
            navigate('/login');
        } catch (error) {
            const apiError = error instanceof Error ? error.message : 'Erro desconhecido';
            setErrors({ api: apiError });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: '#f4f4f4'
            }}>
            <Typography variant="h4" component="h1">
                Cadastro de usuário
            </Typography>
            <Container
                sx={{ mt: 10, mb: 6 }}
                maxWidth="sm"
            >
                <TextField
                    fullWidth
                    label="Nome"
                    name="nome"
                    variant="outlined"
                    margin="normal"
                    value={formData.nome}
                    onChange={handleChange}
                    error={!!errors.nome}
                    helperText={errors.nome}
                />
                <TextField
                    fullWidth
                    label="Nome de Usuário"
                    name="username"
                    variant="outlined"
                    margin="normal"
                    value={formData.username}
                    onChange={handleChange}
                    error={!!errors.username}
                    helperText={errors.username}
                />
                <TextField
                    fullWidth
                    label="Contato"
                    name="contato"
                    variant="outlined"
                    margin="normal"
                    value={formData.contato}
                    onChange={handleChange}
                    error={!!errors.contato}
                    helperText={errors.contato}
                />
                <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    variant="outlined"
                    margin="normal"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                />
                <TextField
                    fullWidth
                    label="Senha"
                    name="senha"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={formData.senha}
                    onChange={handleChange}
                    error={!!errors.senha}
                    helperText={errors.senha}
                />
                <TextField
                    fullWidth
                    label="Confirme a Senha"
                    name="confSenha"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={formData.confSenha}
                    onChange={handleChange}
                    error={!!errors.confSenha}
                    helperText={errors.confSenha}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.isOrganizer} 
                            onChange={handleChange}
                            name="isOrganizer"
                        />
                    }
                    label="Sou um organizador de campeonatos"
                    sx={{ mt: 1, display: 'block' }}
                />
                {errors.api && (
                    <Typography color="error" variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                        {errors.api}
                    </Typography>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                    disabled={loading}
                >
                    {loading ? 'Cadastrando...' : 'Cadastrar'}
                </Button>
            </Container>
        </Box>
    );
}
