import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/messages.model.js";
import User from "../models/user.model.js";

//get all users
export const getUsersForSidebar = async(req,res)=>{
    //req is coming from protectRoute
    try{
        const loggedInuserId = req.user._id;
        const filteredUsers = await User.find({_id:{ $ne:loggedInuserId }}).select("-password");
        res.status(200).json(filteredUsers);
    }catch(error){
        console.log("Error in fetching all users",error.message);
        return res.status(500).json({message:"Internal server error"});
    }
};

//get messages
export const getMessages = async(req,res) => {
    try {
        const { id:userToChatId } = req.params;
        const myId = req.user._id;
        const message = await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId} 
            ]
        }).sort({createdAt:1});

        res.status(200).json(message);
    } catch (error) {
        console.log("Error in fetching messages",error.message);
        return res.status(500).json({message:"Internal server error"});
    }
};

//send messages to others
export const sendMessage = async(req,res) => {
    try {
        const {text,image} = req.body;
        const { id:receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        };
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sending Message controller: ",error.message);
        res.status(500).json({message:"Internal server Error"});
    }
}