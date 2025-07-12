import express from 'express';
import ImageKit from 'imagekit';
import cors from 'cors';
import mongoose from 'mongoose';
import Chat from './models/chat.js';
import UserChats from './models/userChats.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import env from 'dotenv'

env.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(express.json())
console.log('Allowed origin from env:', process.env.CLIENT_URL);
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));




const connect = async () =>{
    try{
        await mongoose.connect(process.env.MONGO);
        console.log("connect to the mongodb")
    }catch(err){
        console.log(err);
    }
}

const imagekit = new ImageKit({
    urlEndpoint: process.env.VITE_IMAGE_KIT_ENDPOINT,
    publicKey: process.env.VITE_IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.VITE_IMAGE_KIT_PRIVATE_KEY
});

app.get('/api/upload', (req,res)=>{
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
})

app.post('/api/chats',ClerkExpressRequireAuth(), async (req, res)=>{
    const userId = req.auth.userId;
    const {text} = req.body;
    try{
        //create a new chat

        const newChat = new Chat({
            userId: userId,
            history:[{role:"user",parts:[{text}]}]
        })
        await newChat.validate();  

        const savedChat = await newChat.save();

        //check if the userchats exits
        const userChats = await UserChats.find({userId: userId})

        //if it doesnt exist create a new one and add the chat in the chats array
        if(!userChats.length){
            const newUserChats = new UserChats({
                userId: userId,
                chats:[
                    {
                        _id: savedChat.id,
                        title: text.substring(0,40)
                    }
                ]
            })
            await newUserChats.save();
        }else{
            //if exits ,push the chat to the exiting array
            await UserChats.updateOne({userId: userId}, {
                $push:{
                    chats:{
                        _id: savedChat._id,
                        title: text.substring(0,40),
                    }
                }
            })
            res.status(201).json({id: newChat._id});
        }
    }catch(err){
        console.log(err);
        res.status(500).send("Error creating chat")
    }
})

app.get('/api/userChats', ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req.auth.userId;
    try {
        const userChats = await UserChats.findOne({ userId });

        if (userChats) {
        res.status(200).json(userChats);
        } else {
        // Return empty object with empty chats
        res.status(200).json({
            userId,
            chats: []
        });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching userChats");
    }
});


app.get('/api/chats/:id', ClerkExpressRequireAuth(), async (req, res)=>{
    const userId = req.auth.userId;
    try{
        const chat = await Chat.findOne({_id: req.params.id, userId});
        if (!chat) {
            return res.status(404).send("Chat not found");
        }
        res.status(200).send(chat);
    }catch(err){
        console.log(err);
        res.status(500).send("error fetching the chat")
    }
})

app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req, res)=>{
    const userId = req.auth.userId;

    const {question, answer, img} = req.body;
    const newItems = [
    ...(question ? 
            [{role: "user", parts: [{text: question}]}]
            : []),
        {role: "model", parts: [{ text: answer}], ...(img && {img})},
    ]
    try{
        const updatedChat = await Chat.updateOne({ _id: req.params.id, userId },{
            $push:{
                history:{
                    $each: newItems
                }
            }
        })
        res.status(200).send(updatedChat)
    }catch(err){
        console.log(err);
        res.status(500).send("error updating chat")
    }
})

app.use((err,req,res,next)=>{
    console.log(err.stack);
    res.status(401).send("unauthenticated")
})

app.listen(port, ()=>{
    connect()
    console.log(`Server is running on port ${port}`);
})