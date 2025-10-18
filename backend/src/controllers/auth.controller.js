import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req,res)=>{
    const { fullName,email,password } = req.body;
    try{
        if(!fullName || !email || !password){
            return res.status(400).json({message:"Please fill all the fields"});
        }
        if(password.length < 6){
            return res.status(400).json({ message:"Password must be greater then 6 chars" });
        }
        const user = await User.findOne({email});
        if(user){
            console.log("Email already exits");
            return res.status(400).json({ message:"Email already exits" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password:password,
        });

        // gen jwt token
        await newUser.save();
        generateToken(newUser._id,res);

        res.status(201).json({
            _id:newUser._id,
            fullName:newUser.fullName,
            email:newUser.email,
            profilePic:newUser.profilePic,
        });
        // console.log("token ",generateToken());
    }catch(error){
        console.log("Error in signup controller",error.message);
        res.status(500).json({message:"Internal server error"});
    }
};

export const login = async (req,res)=>{
    const { email,password }= req.body;
    try{
        if(!email || !password )
            return res.status(404).json({message:"All Fields are required"});
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Inncorrect Email or password"});
        }

        const isPasswordCorrect = user.password === password;
        if(!isPasswordCorrect)
            return res.status(400).json({message:"Inncorrect Email or password"});
        generateToken(user._id,res);

        res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            email:user.email,
            profilePic:user.profilePic,
        });

    }catch(error){
        console.log("Error in logging In");
        return res.status(500).json({message:"Internal Server Error"});
    }
};

export const logout = (req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Logged Out Successfully"});
    }catch(error){
        console.log("Error in Logging out ",error.message);
        res.status(500).json({message:"Internal server error"});
    }
};

export const loggedin = (req,res)=>{
    try{
        res.status(200).json(req.user);
    }catch(error){
        console.log("Error in logged in controller ",error.message);
        res.status(500).json({message:"Internal server error"});
    }
};

export const updateProfile = async(req,res) => {
    try{
        const { profilePic } = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message:"Profile pic is required"});
        }
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updateUser = await User.findByIdAndUpdate(
            userId,
            {profilePic:uploadResponse.secure_url},
            {new:true},
        );
        res.status(200).json(updateUser);
    }catch(error){
        console.log("Error in updating profile",error.message);
        res.status(500).json({message:"Interval server error"});
    }
};
