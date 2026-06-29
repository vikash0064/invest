import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { connectDB } from './config/db.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import userRoutes from './routes/userRoutes.js'
import researchRoutes from './routes/researchRoutes.js'
import authRoutes from './routes/authRoutes.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Connect DB
connectDB()

// Middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/api/users', userRoutes)
app.use('/api/research', researchRoutes)
app.use('/api/auth', authRoutes)
app.get('/api', (req, res) => res.json({ message: 'API is running' }))

// Serve Frontend Static Assets
app.use(express.static(path.join(__dirname, '../client/out')))

// SPA routing fallback (serve index.html for frontend routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/out/index.html'))
})

// Error Handler
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))