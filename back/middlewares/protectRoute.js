import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req,res,next) => {

    try {
    
        const token = req.cookies.jwt;
        if(!token) {
            return res.status(401)
            .json({
                error: "Unauthorised: no Token Provided"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!token) {
            return res.status(401)
            .json({
                error: "Unauthorised: Invalid Token"
            })
        }

        const user = await User.findById(decoded.userId).select("-password");

        if(!user) {
            return res.status(404)
            .json({
                error: "No user found"
            })
        }

        req.user = user;
        next();

    } catch (error) {

        console.log("Error in protectRoute", error.message);

        return res.status(500)
        .json({
            error: "Internel Server error"
        });

    }

}

// export default protectRoute;