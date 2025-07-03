import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js"

import connectMongoDB from "./DB/connectMongoDB.js";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const app = express();

// MIDDLEWARES FOR DATA TO PARSE
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());

// ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);   

// PORT
app.listen(process.env.PORT, ()=> {
    console.log("server up and running on port 8080")
    connectMongoDB();  
})