import { Box, Button, Container, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { useState } from "react";
import type { FormEvent, ChangeEvent } from "react";

interface ValidationErrorInterface {
    name?: string;
    contact?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

interface FormDataInterface {
    name: string;
    contact: string;
    email: string;
    password: string;
    confirmPassword: string;
    isOrganizer?: boolean;
};

export const CadastroPage = () => {
    const [formData, setFormData] = useState<FormDataInterface>({
        name: '',
        contact: '',
        email: '',
        password: '',
        confirmPassword: '',
        isOrganizer: false,
    });
    const [errors, setErrors] = useState<ValidationErrorInterface>({});

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name } = event.target;

        const isCheckbox = event.target.type === 'checkbox';

        // Pega o valor:
        // Se for checkbox, usa 'checked' (true/false)
        // Se não for, usa 'value' (o texto)
        const value = isCheckbox ? event.target.checked : event.target.value;
        
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name as keyof ValidationErrorInterface]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Impede o recarregamento da página

        const { name, contact, email, password, confirmPassword } = formData;
        const newErrors: ValidationErrorInterface = {};

        // Validação de campos vazios
        if (!name) newErrors.name = "O nome é obrigatório.";
        if (!contact) newErrors.contact = "O contato é obrigatório.";
        if (!email) newErrors.email = "O email é obrigatório.";
        if (!password) newErrors.password = "A senha é obrigatória.";

        // Validação da confirmação de senha
        if (!confirmPassword) {
            newErrors.confirmPassword = "A confirmação da senha é obrigatória.";
        } else if (password && password !== confirmPassword) {
            // Só executa se a senha principal foi preenchida
            newErrors.confirmPassword = "As senhas não conferem.";
        }

        if (Object.keys(newErrors).length > 0) {
            // Se houver erros, atualiza o estado de erros e para a execução
            setErrors(newErrors);
            return;
        }

        console.log("Formulário validado! Pronto para enviar (simulação):", formData);
        
        // (No futuro, aqui você chamará seu serviço de cadastro)
        // ex: try {
        //         await authService.register(formData);
        //         navigate('/login');
        //     } catch (err) {
        //         setErrors({ api: err.message });
        //     }
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
                    name="name"
                    variant="outlined"
                    margin="normal"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                />
                <TextField
                    fullWidth
                    label="Contato"
                    name="contact"
                    variant="outlined"
                    margin="normal"
                    value={formData.contact}
                    onChange={handleChange}
                    error={!!errors.contact}
                    helperText={errors.contact}
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
                    name="password"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={!!errors.password}
                    helperText={errors.password}
                />
                <TextField
                    fullWidth
                    label="Confirme a Senha"
                    name="confirmPassword"
                    variant="outlined"
                    margin="normal"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.isOrganizer} 
                            onChange={handleChange}
                            name="isOrganizer"
                        />
                    }
                    // 3. Adicione um rótulo (Label)
                    label="Sou um organizador de campeonatos"
                    sx={{ mt: 1, display: 'block' }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Cadastrar
                </Button>
            </Container>
        </Box>
    );
}
