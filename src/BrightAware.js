import Config from './config';
import { useState, useEffect } from "react";
import {
    TextField, Button, Typography, Container, Alert,
    Box, CircularProgress, useMediaQuery, IconButton, Grid
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Pause, PlayArrow, Replay } from "@mui/icons-material";

// Replace the image path declarations
const uvChart = Config.images.uvChart;
const cancerChart = Config.images.cancerChart;


const theme = createTheme({
    palette: {
        primary: { main: "#1976D2" },
        secondary: { main: "#D32F2F" },
    },
});

const getUvColor = (uvIndex) => {
    if (uvIndex === 0) return "#616161";
    if (uvIndex < 3) return "#2E7D32";
    if (uvIndex < 6) return "#FFEB3B";
    if (uvIndex < 8) return "#FF9800";
    if (uvIndex < 11) return "#F44336";
    return "#9C27B0";
};

const getRecommendedTime = (uvIndex, sunsetSoon) => {
    if (uvIndex === 0 || sunsetSoon) return 0;
    if (uvIndex < 3) return 120 * 60;  // 2 hours in seconds
    if (uvIndex < 6) return 90 * 60;
    if (uvIndex < 8) return 60 * 60;
    if (uvIndex < 11) return 45 * 60;
    return 30 * 60;
};

function BrightAware() {
    const [postcode, setPostcode] = useState("");
    const [uvIndex, setUvIndex] = useState(null);
    const [sunsetSoon, setSunsetSoon] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [customHours, setCustomHours] = useState("");
    const [customMinutes, setCustomMinutes] = useState("");
    const [debugUvi, setDebugUvi] = useState(null);
    const isMobile = useMediaQuery("(max-width:600px)");

    useEffect(() => {
        let interval;
        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, secondsLeft]);

    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSetCustomTime = () => {
        const hours = parseInt(customHours) || 0;
        const minutes = parseInt(customMinutes) || 0;
        const totalSeconds = (hours * 3600) + (minutes * 60);

        if (totalSeconds > 0) {
            setSecondsLeft(totalSeconds);
            setIsActive(true);
        }
        setCustomHours("");
        setCustomMinutes("");
    };

    // Debug mode for testing
    const simulateUvi = () => {
        const uvi = parseFloat(debugUvi) || 0;
        setUvIndex(uvi);
        setSunsetSoon(Math.random() < 0.5); // Random sunset status for testing
    };
// Fetch UV index using user's location
    const fetchUvIndexByLocation = () => {
        setError("");
        setLoading(true);

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetch("http://127.0.0.1:5000/api/uv-index-location", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ lat: latitude, lon: longitude })
                    })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                setError(data.error);
                                setUvIndex(null);
                            } else {
                                setUvIndex(data.uv_index);
                            }
                        })
                        .catch(() => setError("Failed to fetch UV index"))
                        .finally(() => setLoading(false));
                },
                (error) => {
                    setError("Failed to get location: " + error.message);
                    setLoading(false);
                }
            );
        } else {
            setError("Geolocation is not supported in this browser.");
            setLoading(false);
        }
    };

    // Fetch UV index using postcode
    const fetchUvIndexByPostcode = () => {
        setError("");
        setLoading(true);

        fetch("http://127.0.0.1:5000/api/uv-index", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postcode })
        })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                    setUvIndex(null);
                } else {
                    setUvIndex(data.uv_index);
                }
            })
            .catch(() => setError("Failed to fetch UV index"))
            .finally(() => setLoading(false));
    };
    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                    🌞 BrightAware
                </Typography>

                {uvIndex !== null && (
                    <Box sx={{
                        bgcolor: getUvColor(uvIndex),
                        color: "white",
                        p: 2,
                        borderRadius: 2,
                        mb: 3
                    }}>
                        <Typography variant="h5">
                            Current UV Index: {uvIndex}
                        </Typography>
                        {(uvIndex === 0 || sunsetSoon) ? (
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                ☁️ No sunscreen needed
                            </Typography>
                        ) : (
                            <Typography>
                                Recommended reapplication: every {getRecommendedTime(uvIndex, false)/60} minutes
                            </Typography>
                        )}
                    </Box>
                )}

                {/* Timer Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h2" component="div" sx={{ fontFamily: 'monospace' }}>
                        {formatTime(secondsLeft)}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <IconButton
                            onClick={() => setIsActive(!isActive)}
                            color="primary"
                            disabled={uvIndex === 0 || sunsetSoon}
                        >
                            {isActive ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setSecondsLeft(getRecommendedTime(uvIndex || 0, sunsetSoon));
                                setIsActive(true);
                            }}
                            color="secondary"
                            disabled={uvIndex === 0 || sunsetSoon}
                        >
                            <Replay fontSize="large" />
                        </IconButton>
                    </Box>
                </Box>

                {/* Custom Time Input */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                        <TextField
                            label="Hours"
                            type="number"
                            value={customHours}
                            onChange={(e) => setCustomHours(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Minutes"
                            type="number"
                            value={customMinutes}
                            onChange={(e) => setCustomMinutes(e.target.value)}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            onClick={handleSetCustomTime}
                            disabled={!customHours && !customMinutes}
                            fullWidth
                        >
                            Set Custom Time
                        </Button>
                    </Grid>
                </Grid>

                {/* Information Charts */}
                <Grid container spacing={3} sx={{ mt: 4 }}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Victorian UV Index Levels
                        </Typography>
                        <img
                            src={uvChart}
                            alt="UV Index Chart"
                            style={{ width: '100%', borderRadius: '8px' }}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                            Skin Cancer Mortality Rates
                        </Typography>
                        <img
                            src={cancerChart}
                            alt="Cancer Mortality Chart"
                            style={{ width: '100%', borderRadius: '8px' }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                    <TextField
                        label="Postcode lookup"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        sx={{ flexGrow: 1 }}
                    />
                    <Button
                        variant="contained"
                        onClick={fetchUvIndexByPostcode}
                        disabled={loading}
                    >
                        Get by Postcode
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={fetchUvIndexByLocation}
                        disabled={loading}
                    >
                        Use My Location
                    </Button>
                </Box>
                {/* Debug Panel */}
                <Box sx={{ mb: 4, p: 2, border: '1px dashed grey' }}>
                    <Typography variant="h6">Developer Test Mode</Typography>
                    <TextField
                        label="Simulate UV Index"
                        type="number"
                        value={debugUvi}
                        onChange={(e) => setDebugUvi(e.target.value)}
                        sx={{ mr: 2, width: 120 }}
                    />
                    <Button variant="outlined" onClick={simulateUvi}>
                        Test UV Display
                    </Button>
                </Box>
            </Container>

        </ThemeProvider>
    );
}

export default BrightAware;