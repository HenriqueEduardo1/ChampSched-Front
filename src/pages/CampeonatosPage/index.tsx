import { useState, useEffect } from "react";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Card,
    CardContent,
    CardActions,
    Typography,
    Grid,
    Alert,
    Snackbar,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    OutlinedInput,
    CircularProgress,
} from "@mui/material";
import { Link } from 'react-router-dom';
import type { SelectChangeEvent } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { MainToolbar } from "../../components/main-toolbar";
import { createCampeonato, getCampeonatos } from "../../services/campeonato";
import { getTimes } from "../../services/time";
import { getMe } from "../../services/auth";
import type { CampeonatoType, CreateCampeonatoData } from "../../types/campeonato";
import type { TimeType } from "../../types/time";

export const CampeonatosPage = () => {
    const [campeonatos, setCampeonatos] = useState<CampeonatoType[]>([]);
    const [times, setTimes] = useState<TimeType[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [organizadorId, setOrganizadorId] = useState<number | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({
        open: false,
        message: "",
        severity: "success",
    });

    const [formData, setFormData] = useState<CreateCampeonatoData>({
        nome: "",
        esporte: "",
        data: "",
        organizadorId: 0,
        timesIds: [],
    });

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            setError(null);
            await Promise.all([loadCampeonatos(), loadTimes(), loadOrganizadorId()]);
            setIsLoading(false);
        };

        init();
    }, []);

    const loadCampeonatos = async () => {
        try {
            const data = await getCampeonatos();
            setCampeonatos(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar campeonatos';
            setError(message);
        }
    };

    const loadTimes = async () => {
        try {
            const data = await getTimes();
            setTimes(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar times';
            setError(message);
        }
    };

    const loadOrganizadorId = async () => {
        try {
            const user = await getMe();
            setOrganizadorId(user.id);
            setFormData(prev => ({ ...prev, organizadorId: user.id }));
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao carregar dados do usuário';
            setError(message);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            nome: "",
            esporte: "",
            data: "",
            organizadorId: organizadorId || 0,
            timesIds: [],
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTimesChange = (event: SelectChangeEvent<number[]>) => {
        const value = event.target.value;
        setFormData((prev) => ({
            ...prev,
            timesIds: typeof value === 'string' ? [] : value as number[],
        }));
    };

    const handleSubmit = async () => {
        setError(null);

        if (!formData.nome || !formData.esporte || !formData.data) {
            showSnackbar("Por favor, preencha todos os campos obrigatórios", "error");
            return;
        }

        if (formData.timesIds.length < 2) {
            showSnackbar("Selecione pelo menos 2 times para o campeonato", "error");
            return;
        }

        setLoading(true);

        try {
            const created = await createCampeonato(formData);

            setCampeonatos((prev) => [created as CampeonatoType, ...prev]);

            showSnackbar("Campeonato criado com sucesso!", "success");
            handleCloseDialog();

            await loadCampeonatos();
        } catch (error) {
            showSnackbar("Erro ao criar campeonato", "error");
        } finally {
            setLoading(false);
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    return (
        <>
            <MainToolbar />
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant="h4" component="h1">
                        Campeonatos
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                    >
                        Novo Campeonato
                    </Button>
                </Box>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">{error}</Alert>
                ) : campeonatos.length === 0 ? (
                    <Alert severity="info">
                        Nenhum campeonato cadastrado. Crie seu primeiro campeonato!
                    </Alert>
                ) : (
                    <Grid container spacing={3}>
                        {campeonatos.map((campeonato) => (
                            <Grid item xs={12} sm={6} md={4} key={campeonato.id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            {campeonato.nome}
                                        </Typography>
                                        <Typography color="text.secondary" gutterBottom>
                                            Esporte: {campeonato.esporte}
                                        </Typography>
                                        <Typography color="text.secondary" gutterBottom>
                                            Data: {new Date(campeonato.data).toLocaleDateString('pt-BR')}
                                        </Typography>
                                        <Typography color="text.secondary" gutterBottom>
                                            Organizador: {campeonato.organizador.nome}
                                        </Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="body2" gutterBottom>
                                                Times ({campeonato.times.length}):
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {campeonato.times.map((time) => (
                                                    <Chip
                                                        key={time.id}
                                                        label={time.nome}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                ))}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to={`/campeonatos/${campeonato.id}`}>
                                            Ver detalhes
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Criar Novo Campeonato</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
                            <TextField
                                label="Nome do Campeonato"
                                name="nome"
                                value={formData.nome}
                                onChange={handleInputChange}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Esporte"
                                name="esporte"
                                value={formData.esporte}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                placeholder="Ex: Futsal, Basquete, Vôlei"
                            />
                            <TextField
                                label="Data"
                                name="data"
                                type="date"
                                value={formData.data}
                                onChange={handleInputChange}
                                fullWidth
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="times-label">Times *</InputLabel>
                                <Select
                                    labelId="times-label"
                                    multiple
                                    value={formData.timesIds}
                                    onChange={handleTimesChange}
                                    input={<OutlinedInput label="Times *" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => {
                                                const time = times.find(t => t.id === value);
                                                return (
                                                    <Chip key={value} label={time?.nome || `Time ${value}`} />
                                                );
                                            })}
                                        </Box>
                                    )}
                                >
                                    {times.map((time) => (
                                        <MenuItem key={time.id} value={time.id}>
                                            {time.nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <Alert severity="info">
                                Selecione pelo menos 2 times para criar o campeonato.
                            </Alert>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancelar</Button>
                        <Button
                            onClick={handleSubmit}
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? "Criando..." : "Criar Campeonato"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: "100%" }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </>
    );
};

