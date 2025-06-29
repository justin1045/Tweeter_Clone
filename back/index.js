import express from "express";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import connectMongoDB from "./DB/connectMongoDB.js";

dotenv.config();
const app = express();

app.use("/api/v1/auth", authRoutes);


app.listen(process.env.PORT, ()=> {
    console.log("server up and running on port 8080")
    connectMongoDB();  
})