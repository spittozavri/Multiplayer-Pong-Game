import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './components.css';

const rootElement = document.getElementById('root');

if (rootElement) {
    const root = createRoot(rootElement);

    root.render(
        <StrictMode>
            <App />
        </StrictMode>
    );
} else {
    console.error('Root element not found!');
}
