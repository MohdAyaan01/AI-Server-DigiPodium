import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(/\s+/)[1];
        if (!token || token === 'undefined' || token === 'null') {
            return res.status(401).json({ message: "Please Login First",success: false });
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY);
        req.id = decode.userId;
        next();
    } catch (err) {
        console.error("Authentication Error:", err.message);
        return res.status(401).json({ message: "Authentication Error", error: err.message });
    }
}
export default isAuthenticated