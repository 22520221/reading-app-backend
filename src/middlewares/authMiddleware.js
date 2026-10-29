const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    // Lay token tu header Authorization
    const authHeader = req.headers.authorization;

    // Kiem tra header co ton tai va dung dinh dang Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Vui long cung cap JWT token"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "JWT token khong hop le"
        });
    }

    // Xac minh token bang JWT_SECRET
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "JWT token khong hop le hoac da het han"
            });
        }

        // Luu thong tin nguoi dung vao request
        req.user = {
            userId: decoded.userId,
            role: decoded.role
        };

        next();
    });
}

module.exports = { authenticateToken };
