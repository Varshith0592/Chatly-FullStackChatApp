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
const __dirname=path.resolve()


app.use(bodyParser.json({ limit: '10mb' }))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))
app.use(cookieparser())
app.use(express.json())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))


app.use('/api/auth', authRoutes)
app.use('/api/message', messageRoutes)

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname, '../frontend/dist')))

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname, "../frontend","dist","index.html"))
    })
}

server.listen(PORT, () => {
    console.log('Server is running on port', PORT)
    connectDB()
})