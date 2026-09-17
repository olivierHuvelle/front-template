import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { bootstrapApplication } from '@/core/bootstrap/bootstrapApplication.ts'

import './index.css'
import App from './App.tsx'

bootstrapApplication()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
