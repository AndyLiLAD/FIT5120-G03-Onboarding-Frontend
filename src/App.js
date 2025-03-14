import { useState, useEffect } from "react";
import { TextField, Button, Typography, Container, Snackbar, Alert, Box, CircularProgress, useMediaQuery } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Define a responsive Material UI theme
const theme = createTheme({
    palette: {
        primary: { main: "#1976D2" },
        secondary: { main: "#D32F2F" },
    },
});

// Function to determine UV Index color
const getUvColor = (uvIndex) => {
    if (uvIndex < 3) return "#2E7D32";  // Green (Low)
    if (uvIndex < 6) return "#FFEB3B";  // Yellow (Moderate)
    if (uvIndex < 8) return "#FF9800";  // Orange (High)
    if (uvIndex < 11) return "#F44336"; // Red (Very High)
    return "#9C27B0";  // Purple (Extreme)
};

// Function to determine sunscreen reapplication time
const getSunscreenTime = (uvIndex) => {
    if (uvIndex === 0) return "No need to use sunscreen.";
    if (uvIndex < 3) return "Reapply every 2 hours.";
    if (uvIndex < 6) return "Reapply every 1.5 hours.";
    if (uvIndex < 8) return "Reapply every 1 hour.";
    if (uvIndex < 11) return "Reapply every 45 minutes.";
    return "Reapply every 30 minutes.";
};

function App() {
    const [postcode, setPostcode] = useState("");
    const [uvIndex, setUvIndex] = useState(null);
    const [email, setEmail] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    // Check if user is on a mobile screen
    const isMobile = useMediaQuery("(max-width:600px)");

    useEffect(() => {
        let interval;
        if (secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [secondsLeft]);

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
            <Container
                maxWidth="sm"
                sx={{ mt: isMobile ? 3 : 5, textAlign: "center", padding: isMobile ? 2 : 4 }}
            >
                <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                    🌞 UV Index Finder
                </Typography>

                {/* UV Index Display */}
                {uvIndex !== null && (
                    <Box
                        sx={{
                            backgroundColor: getUvColor(uvIndex),
                            color: "#fff",
                            padding: isMobile ? 1.5 : 2,
                            borderRadius: 2,
                            mt: 2,
                            width: isMobile ? "90%" : "50%",
                            margin: "auto",
                            fontSize: isMobile ? "1.2rem" : "1.5rem",
                        }}
                    >
                        <Typography variant="h6">UV Index: {uvIndex}</Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            {getSunscreenTime(uvIndex)}
                        </Typography>
                    </Box>
                )}

                {/* Error Message */}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                {/* Loading Indicator */}
                {loading && <CircularProgress sx={{ mt: 2 }} />}

                {/* Input for Postcode */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant={isMobile ? "h6" : "h5"}>Find by Postcode</Typography>
                    <TextField
                        label="Enter postcode"
                        variant="outlined"
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        sx={{ mt: 2, width: "100%" }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={fetchUvIndexByPostcode}
                        disabled={loading}
                        sx={{ mt: 2, width: "100%", fontSize: isMobile ? "0.9rem" : "1rem" }}
                    >
                        Get UV Index by Postcode
                    </Button>
                </Box>

                {/* Find by Location */}
                <Box sx={{ mt: 4 }}>
                    <Typography variant={isMobile ? "h6" : "h5"}>Find by Current Location</Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={fetchUvIndexByLocation}
                        disabled={loading}
                        sx={{ mt: 2, width: "100%", fontSize: isMobile ? "0.9rem" : "1rem" }}
                    >
                        Get UV Index by My Location
                    </Button>
                </Box>

            </Container>
        </ThemeProvider>
    );
}

export default App;
