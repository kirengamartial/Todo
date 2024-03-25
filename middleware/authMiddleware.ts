import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken';

dotenv.config()
const jwtSecret = process.env.JWT_SECRET!;

export const requireAuth = (req: Request, res: Response, next: NextFunction)  => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, jwtSecret, (err: jwt.VerifyErrors | null, decodedToken: any) => {
            if(err) {
                console.log(err.message);
                res.status(400).json(err.message);
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.status(400).json({message: "user is not logined in"});
    }
}


export const preventLoggedInUserAccess = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;
    if (token) {
        res.status(403).json({ message: "Logged-in users cannot access this endpoint" });
    } else {
        next();
    }
};


