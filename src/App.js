import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './home';
import BrightAware from './BrightAware';
import { loadConfig } from './config';

function App() {
    useEffect(() => {
        loadConfig();
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/app" element={<BrightAware />} />
            </Routes>
        </Router>
    );
}

export default App;