import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import connectMongoDB from "./DB/connectMongoDB.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// MIDDLEWARES FOR DATA TO PARSE
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());

// ROUTES
app.use("/api/v1/auth", authRoutes);

// PORT
app.listen(process.env.PORT, ()=> {
    console.log("server up and running on port 8080")
    connectMongoDB();  
})