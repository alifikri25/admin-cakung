import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext'
import { CacheProvider } from './contexts/CacheContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <CacheProvider>
        <App />
      </CacheProvider>
    </ThemeProvider>
  </StrictMode>,
)