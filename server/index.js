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

app.post('/api/chats', ClerkExpressRequireAuth(), async (req, res) => {
    const userId = req.auth.userId;
    const text = req.body?.text != null ? String(req.body.text).trim() : '';
    if (!text) {
        return res.status(400).json({ error: 'Message is required' });
    }
    try {
        const newChat = new Chat({
            userId,
            history: [{ role: 'user', parts: [{ text }] }],
        });
        await newChat.validate();

        const savedChat = await newChat.save();
        const chatId = savedChat._id.toString();
        const title = text.substring(0, 40);

        const userChats = await UserChats.find({ userId });

        if (!userChats.length) {
            const newUserChats = new UserChats({
                userId,
                chats: [{ _id: chatId, title }],
            });
            await newUserChats.save();
        } else {
            await UserChats.updateOne(
                { userId },
                {
                    $push: {
                        chats: { _id: chatId, title },
                    },
                }
            );
        }

        return res.status(201).json({ id: chatId });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error creating chat' });
    }
});

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
        return res.status(500).json({ error: 'Error fetching chats' });
    }
});


app.get('/api/chats/:id', ClerkExpressRequireAuth(), async (req, res)=>{
    const userId = req.auth.userId;
    try{
        const chat = await Chat.findOne({_id: req.params.id, userId});
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        return res.status(200).json(chat);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error fetching chat' });
    }
});

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
        return res.status(200).json(updatedChat);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error updating chat' });
    }
});

app.use((err, req, res, next) => {
    console.error(err?.stack || err);
    if (res.headersSent) {
        return;
    }
    return res.status(401).json({ error: 'Unauthenticated' });
});

app.listen(port, ()=>{
    connect()
    console.log(`Server is running on port ${port}`);
})