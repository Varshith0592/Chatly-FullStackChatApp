import express from 'express'
import cookieparser from 'cookie-parser'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import path from 'path'

import authRoutes from './routes/auth.route.js'
import messageRoutes from './routes/message.route.js'
import { connectDB } from './lib/db.js'
import {app,server} from  './lib/socket.js'

dotenv.config()

const PORT = process.env.PORT


app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieparser())
app.use(express.json())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cors({
  origin: [process.env.CLIENT_URL,'http://localhost:5173'],
  credentials: true,
}))


app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)

server.listen(PORT, () => {
    console.log('Server is running on port', PORT)
    connectDB()
})