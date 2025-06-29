import mongoose from "mongoose";

const connectMongoDB = async () => {
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected succesfully");

    } catch (err) {
        console.log(`Error connecting DB: ${err.message});
        }`);
        process.exit(1);
    }
}


export default connectMongoDB;