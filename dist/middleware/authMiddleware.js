"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preventLoggedInUserAccess = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jsonwebtoken_1.default.verify(token, "Martial secret", (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.status(400).json(err.message);
            }
            else {
                console.log(decodedToken);
                next();
            }
        });
    }
    else {
        res.status(400).json({ message: "user is not logined in" });
    }
};
exports.requireAuth = requireAuth;
const preventLoggedInUserAccess = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        res.status(403).json({ message: "Logged-in users cannot access this endpoint" });
    }
    else {
        next();
    }
};
exports.preventLoggedInUserAccess = preventLoggedInUserAccess;
