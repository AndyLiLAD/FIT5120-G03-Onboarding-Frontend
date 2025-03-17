import { Button, Container, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Config from "./config";

function Home() {
    return (
        <Container maxWidth="md" sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
        }}>
            <Box sx={{ mb: 4 }}>
                <img
                    src={Config.images.logo1}
                    alt="Logo 1"
                    style={{ maxWidth: '300px', margin: '16px' }}
                />
                <img
                    src={Config.images.logo2}
                    alt="Logo 2"
                    style={{ maxWidth: '300px', margin: '16px' }}
                />
            </Box>

            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Welcome to BrightAware
            </Typography>

            <Button
                component={Link}
                to="/app"
                variant="contained"
                size="large"
                sx={{ py: 2, px: 6, fontSize: '1.2rem' }}
            >
                Get Started
            </Button>
        </Container>
    );
}

export default Home;