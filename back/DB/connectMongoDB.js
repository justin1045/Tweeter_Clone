import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected successfully");

    } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`); 
        process.exit(1);
    }
}

export default connectMongoDB;