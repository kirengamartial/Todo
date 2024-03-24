import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const requireAuth = (req: Request, res: Response, next: NextFunction)  => {
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token, "Martial secret", (err: jwt.VerifyErrors | null, decodedToken: any) => {
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
        res.status(200).json("login user can not access this endpoint")
    } else {
        next();
    }
};


