import Notification from "../models/notification.nodel.js";
import User from "../models/user.model.js"

import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";

export const getUserProfile = async (req, res) => {

    const {username} = req.params;

    try{

        const user = await User.findOne({username}).select("-password");

        if(!user) {
            res.status(404)
            .json({
                message: "User not found!!"
            })
        }

        res.status(200)
        .json(user);  
         

    } catch (error) {

        console.log("Error in getUserProfile", error.message);
        res.status(500)
        .json({
            error: "error: error.message"
        })

    }

}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Get the array of IDs the current user is already following
        const currentUser = await User.findById(userId).select("following");
        const followingIds = currentUser.following;

        // 2. Create an array of IDs to exclude
        const idsToExclude = [userId, ...followingIds];

        const suggestedUsers = await User.aggregate([
            {
                $match: {
                    _id: { $nin: idsToExclude }
                }
            },
            {
                // Get 5 random user from the results
                $sample: { size: 5 }
            },
            {
                // remove the password field
                $project: {
                    password: 0
                }
            }
        ]);

        res.status(200).json(suggestedUsers);

    } catch (error) {
        console.log("Error in getSuggestedUsers: ", error.message);
        res.status(500).json({
            error: error.message
        });
    }
};


export const followUnfollowUser = async (req, res) => {
       try{

        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);
         
        // console.log("ID from URL params:", req.params.id);
        // console.log("Logged-in user ID:", req.user._id.toString());

        if(id.trim() === req.user._id.toString().trim()) {
            return res.status(400)
            .json({
                error: "You can't follow/unfollow yourself"
            })
        };

        if(!userToModify || !currentUser) {
            return res.status(400)
            .json({
                error: "User not found"
            })
        };

        const isFollowing = currentUser.following.map(oid => oid.toString()).includes(id);


        if (isFollowing) {
            // unfollow user
            await User.findByIdAndUpdate(id, {
                $pull: {followers: req.user._id}
            });

            await User.findByIdAndUpdate(req.user._id, {
                $pull: {following: id}
            });

            res.status(200)
            .json({
                message: "user unfollowed successfully."
            })

        } else {
            // .follow user
            await User.findByIdAndUpdate(id, {
                $push: {followers: req.user._id}
            });

            await User.findByIdAndUpdate(req.user._id, {
                $push: {following: id}
            });

            // send notification to user
           const newNotification = new Notification({
              type: "follow",
              from: req.user._id,
              to: userToModify._id
           });

           await newNotification.save();
          
           res.status(200)
           .json({
            message: "User followed successfully."
           })

             
        }

       } catch (error) {
        console.log("Error in followUnfollowUser: ", error.message);
        res.status(500)
        .json({
            error: error.message
        })
       }
}

export const updateUser = async (req, res) => {

    const {fullName, email, username, currentPassword, newPassword, bio,link} = req.body;
    
    let {profileImg, coverImg} = req.body;

    const userId = req.user._id;

    try {

        let user = await User.findById(userId);
        if(!user) {
            return res.status(404)
            .json({
                message:"User not found"
            })
        }

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400)
            .json({
                error: "please provide new pass and curr pass!!"
            })
        }

        if(currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if(!isMatch) {
                return res.status(400)
                .json({
                    error: "Current password is incorrect!!"
                });
            }

            if(newPassword.length < 6) {
                return res.status(400)
                .json({
                    error: "Password must be atleast 6 character long"
                });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if(profileImg) {

            if(user.profileImage) {

                await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0]);

            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg)

           profileImg = uploadedResponse.secure_url;

        }

        if(coverImg) {

            if(user.coverImage) {

                await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split(".")[0]);

            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg);

            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
         user.username = username || user.username;
         user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImage = profileImg || user.profileImage;
        user.coverImage = coverImg || user.coverImage;
       

        user = await user.save();
// password will be nulled in the response only not in DB
        user.password = null;

        return res.status(200)
        .json(user)


    } catch (error) {

        console.log("Error in updateUser", error.message);
        res.status(500)
        .json({
            error: error.message
        });
    }

}