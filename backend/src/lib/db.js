import mongoose from 'mongoose'
import {config} from 'dotenv'

config()

export const connectDB=async()=>{
    try {
        const con=await mongoose.connect(process.env.MONGO_URI)
        console.log('MongoDB connected')
    }catch(e){
        console.log("MongoDB connection error:",e)
    }
}