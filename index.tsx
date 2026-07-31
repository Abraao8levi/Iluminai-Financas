import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './src/contexts/AuthContext';
import { FinancialProvider } from './src/contexts/FinancialContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Elemento root não encontrado");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <FinancialProvider>
        <App />
      </FinancialProvider>
    </AuthProvider>
  </React.StrictMode>
);