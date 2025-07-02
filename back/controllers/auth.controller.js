import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateToken.js";

export const signup = async (req,res) => {
    try{
        const {fullName, username, email,password} = req.body;

    //    VALIDATION

    if (!fullName || !username || !email || !password) {
            return res.status(400)
            .json({ error: "Missing required fields" });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
        if(!emailRegex.test(email)) {
            return res.status(400)
            .json({
                error: "invalid email format"
            })
        }

        const existingUser = await User.findOne({username});

        if(existingUser) {
            return res.status(400)
            .json({
                error: "username is already taken"
            })
        }

        const existingEmail = await User.findOne({email});

        if(existingEmail) {
            return res.status(400)
            .json({
                error: "email is already taken"
            })
        }
        
        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long" });
        }


        // password HASH

        const salt = await bcrypt.genSalt(10);

        const hashPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName:fullName,
            username:username,
            email:email,
            password:hashPassword,
        })
      
        if(newUser) {
           generateTokenAndSetCookie(newUser._id,res)
           await newUser.save();

           res.status(201)
              .json({
                _id : newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImage: newUser.profileImage,
                coverImage: newUser.coverImage,
              })

        } else {

            res.status(400)
               .json({
                error: "Invalid user data"
               });

        }


    } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({
        error: "Internal server error"
    });
  }
}

export const login = async (req,res) => {
    try {

      const {username, password} = req.body;
    
    //   validation

      if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }
    // username
      const user = await User.findOne({ username });

    //   password

    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");

    if(!user || !password) {
        res.status(400)
        .json({
            error: "Invalid username or password"
        })
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200)
    .json({
            _id: user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImage: user.profileImage,
            coverImage: user.coverImage,
        });

    } catch (err) {
    
        console.log("Error in login controller" , err.message);
        res.status(500)
        .json({
            error: "Internel Server Error"
        })
    }
}

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
}

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
}
