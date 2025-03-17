let Config = {
    images: {
        logo1: '/images/logo1.png',
        logo2: '/images/logo2.png',
        uvChart: '/images/state-uvi-chart.png',
        cancerChart: '/images/skin-cancer-chart.jpg'
    }
};

export const loadConfig = async () => {
    try {
        const response = await fetch('/config.json');
        const runtimeConfig = await response.json();
        Config = { ...Config, ...runtimeConfig };
    } catch (error) {
        console.log('Using default configuration');
    }
};

// Merge with environment variables
Config.images = {
    logo1: process.env.REACT_APP_LOGO1_PATH || Config.images.logo1,
    logo2: process.env.REACT_APP_LOGO2_PATH || Config.images.logo2,
    uvChart: process.env.REACT_APP_UV_CHART_PATH || Config.images.uvChart,
    cancerChart: process.env.REACT_APP_CANCER_CHART_PATH || Config.images.cancerChart
};

export default Config;