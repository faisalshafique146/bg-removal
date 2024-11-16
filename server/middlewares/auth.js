import jwt from 'jsonwebtoken';

// Middlware Function to decode the JWT token to get clerkId
const authUser = async (req, res, next) => {
    try {
        const {token} = req.headers
        if(!token) {
            return res.json({ success: false, message: "Not Authorized Login Again" });
        }

        const tokken_decode = jwt.decode(token);
        req.body.clerkId = tokken_decode.clerkId;
        next();
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export default authUser;