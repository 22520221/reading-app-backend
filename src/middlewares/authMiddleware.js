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
    
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        // Kiem tra da xac thuc JWT chua
        if (!req.user) {
            return res.status(401).json({
                message: "Vui long dang nhap"
            });
        }

        // Kiem tra vai tro
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "Ban khong co quyen truy cap"
            });
        }

        next();
    };
}


module.exports = 
{   authenticateToken,
    authorizeRoles
 };
