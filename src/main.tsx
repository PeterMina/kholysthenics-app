import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@mantine/core/styles.layer.css';
import '@mantine/notifications/styles.layer.css';
import '@/index.css';
import '@/App.css';
import { App } from '@/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root is missing from index.html.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
