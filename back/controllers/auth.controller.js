import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const signup = async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        // Validate required fields
        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ error: "Email already exists" });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ error: "Username already exists" });
            }
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }

        const newUser = new User({
            fullName,
            username,
            email,
            password: password,
        });

        if (newUser) {
            // Save user first, then generate token
            await newUser.save(); // The pre-save hook will hash the password
            generateTokenAndSetCookie(newUser._id, res);

            return res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImage: newUser.profileImage,
                coverImage: newUser.coverImage,
            });
        } else {
            return res.status(400).json({ error: "Invalid user data" });
        }
    } catch (error) {
        console.error("Error in signup controller:", error.message);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        console.log(`--- LOGIN ATTEMPT for user: ${username} ---`);

        const user = await User.findOne({ username });

        if (!user) {
            console.log("DEBUG: User not found in database.");
            return res.status(400).json({ error: "Invalid username or password" });
        }
        
        console.log("DEBUG: User found. Stored password hash:", user.password);
        console.log("DEBUG: Password received from client:", password);

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        console.log("DEBUG: Result of bcrypt.compare:", isPasswordCorrect);

        if (!isPasswordCorrect) {
            console.log("DEBUG: Password comparison failed.");
            return res.status(400).json({ error: "Invalid username or password" });
        }

        console.log("DEBUG: Password is correct. Generating token...");
        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

export const logout = async (req,res) => {
    try {

        res.cookie("jwt","", {maxAge:0});
        res.status(200)
        .json({
           message:"logged out successfully."
        })

    } catch (err) {
        console.log("error in logout controller", err.message);
        res.status(500)
        .json({
            error: "Internel server error"
        });
    }
};

export const getMe = async(req,res) => {
    try {

         const user = await User.findById(req.user._id).select("-password");

         res.status(200)
         .json(user);

    } catch (error) {
        console.log("Error in getMe controller", error.message);

        res.status(500)
        .json({
            error: "Internel server error"
        })
    }
};
