import cloudinary from '../lib/cloudinary.js';
import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js'
import bcryptjs from 'bcryptjs'


export const signup=async(req,res)=>{
    const {name,email,password}=req.body;
    try{
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:'Please fill in all fields'
            })
        }

        const userAlreadyExists=await User.findOne({email})
        if(userAlreadyExists){
            return res.status(400).json({
                success:false,
                message:"User already exists"
            })
        }
        if(password.length<6){
            return res.status(400).json({
                success:false,
                message:"Password must be at least 6 characters long"
            })
        }
        
        const hashedPassword=await bcryptjs.hash(password,10);

        const user=new User({
            fullName:name,
            email,
            password:hashedPassword
        })

    
        if(user){
            generateToken(user._id,res)
            await user.save()

            res.status(201).json({
                success:true,
                _id:user._id,
                fullName:user.fullName,
                email:user.email,
                profilePic:user.profilePic
            })

        }else{
            return res.status(500).json({
                success:false,
                message:"Failed to create user"
            })
        }
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const login=async(req,res)=>{
    const {email,password}=req.body
    try{
        const user=await User.findOne({email})
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        const isValidPassword=await bcryptjs.compare(password,user.password)
        if(!isValidPassword){
            return res.status(404).json({
                success:false,
                message:"Invalid password"
            })
        }

        generateToken(user._id,res)

        res.status(200).json({
            success:true,
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }

}

export const logout=async(req,res)=>{
    try{
        res.clearCookie("jwt","",{maxAge:0})
        return res.status(200).json({
            success:true,
            message:"Logged out successfully"
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
    
}

export const updateProfile=async(req,res)=>{
    try{
        const {profilePic}=req.body
        const user=req.user._id

        if(!profilePic){
            return res.status(400).json({
                success:false,
                message:"Please provide a profile picture"
            })
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic)
        const updatedUser=await User.findByIdAndUpdate(user,{profilePic:uploadResponse.secure_url},{new:true})

        res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            updatedUser
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const checkAuth=async(req,res)=>{
    try{
        const user=req.user
        if(!user){
            return res.status(401).json({
                success:false,
                message:"Please login to access this resource"
            })
        }
        res.status(200).json({
            success:true,
            message:"User is authenticated",
            user:req.user
        })
    }catch(e){
        console.log(e);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }

}