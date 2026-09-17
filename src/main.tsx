import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initializeConfig } from '@/core/config/config'
// IDEA : npm run config:check OR "dev": "npm run config:check && vite"

import './index.css'
import App from './App.tsx'

initializeConfig()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
