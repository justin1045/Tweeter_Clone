import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
    }, ],
    profileImage: {
        type: String,
        default: "",
    },
    coverImage: {
        type: String,
        default: "",
    },
    bio: {
        type: String,
        default: "",
    },
    link: {
        type: String,
        default: "",
    },
    likedpost: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: [],
        }
    ]
}, { timestamps: true });

// ADD THIS PRE-SAVE HOOK
// This function will run before a user document is saved
userSchema.pre("save", async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        // Pass any errors to the next middleware
        next(error);
    }
});

const User = mongoose.model("User", userSchema);

export default User;
