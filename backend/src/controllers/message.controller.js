import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js";
import { getReciverSocketId, io } from "../lib/socket.js";


export const getUsersForSidebar=async(req,res)=>{
    try{
        const loggedInUserId=req.user._id;
        const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select('-password')
        

        res.status(200).json({filteredUsers})

    }catch(e){
        console.log(e)
        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getMessages=async(req,res)=>{
    try {
        const {id:userToChatId}=req.params
        const senderId=req.user._id

        const messages=await Message.find({
            $or:[
                {senderId:senderId,recieverId:userToChatId},
                {senderId:userToChatId,recieverId:senderId}
            ]
        }) 

        res.status(200).json({
            success:true,
            messages
        })
        
    } catch (error) {
        console.log(error)
        req.status(500).json({
            success: false,
            message: "Internal Server Error While Fetching Messages"
        })
    }
}

export const sendMessage=async(req,res)=>{
    try{
        const {text,image}=req.body
        const {id:recieverId}=req.params
        const senderId=req.user._id

        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image)
            imageUrl=uploadResponse.secure_url
        }

        const newMessage=new Message({
            senderId,
            recieverId,
            text,
            image:imageUrl
        })

        await newMessage.save()

        const recieverSocketId=await getReciverSocketId(recieverId)
        
        if(recieverSocketId){
            io.to(recieverSocketId).emit('newMessage',newMessage)
        }


        res.status(201).json({
            success:true,
            message:"Message Sent Successfully",
            newMessage
        })
        
    }catch(e){
        console.log(e)
        res.status(500).json({
            success:false,
            message:"Internal Server Error While Sending Message"
        })
    }
}