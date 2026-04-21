const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization;

        // ❌ No token
        if (!token) {
            return res.status(401).json({ error: "Access denied. No token provided." });
        }

        // ✅ Remove "Bearer "
        const cleanToken = token.split(" ")[1];

        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);

        req.user = decoded; // attach user id

        next(); // go to next controller

    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;