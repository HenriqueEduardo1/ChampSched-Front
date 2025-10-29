import { Box, Card, CardContent } from "@mui/material";
import { MainToolbar } from "../../components/main-toolbar";

export const TimesPage = () => {

    return (
        <Box>
            <MainToolbar />
            <Card sx={{ mb: 4, mt: 4, p: 2, maxWidth: 300, margin: '0 auto' }}>
                <CardContent>
                    Time
                </CardContent>
            </Card>
        </Box>
    );
}
