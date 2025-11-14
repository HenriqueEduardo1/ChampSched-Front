import { Paper, Typography, Stack, Divider, Box, useTheme } from '@mui/material';
import type { PartidaType } from '../types/partida';

interface PartidaCardProps {
    partida: PartidaType;
}

export function PartidaCard({ partida }: PartidaCardProps) {
    const theme = useTheme();

    const timeTypographyStyle = (time: string | null) => ({
        color: time ? theme.palette.text.primary : theme.palette.text.secondary,
        fontStyle: time ? 'normal' : 'italic',
    });

    return (
        <Paper
            sx={{
                minWidth: 220,
                width: '100%',
                borderRadius: 2,
            }}
        >

            <Stack divider={<Divider flexItem />}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="body1" sx={timeTypographyStyle(partida.timeA)}>
                        {partida.timeA ?? 'A definir'}
                    </Typography>
                </Box>
                <Box sx={{ p: 2 }}>
                    <Typography variant="body1" sx={timeTypographyStyle(partida.timeB)}>
                        {partida.timeB ?? 'A definir'}
                    </Typography>
                </Box>
            </Stack>
        </Paper>
    );
}