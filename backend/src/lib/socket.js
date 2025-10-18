import { Server } from "socket.io";
import http, { createServer } from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:["http://localhost:5173"],
    },
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}

//use to store online users
const userSocketMap = {}; // userid:socketid

io.on("connection",(socket)=>{
    console.log("A user connected:",socket.id);

    const userId = socket.handshake.query.userId;
    if(userId) userSocketMap[userId] = socket.id;

    // broadcast to all users 
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    
    socket.on("disconnect",()=>{
        console.log("a user disconnected",socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
    });
});

export { io, app, server };