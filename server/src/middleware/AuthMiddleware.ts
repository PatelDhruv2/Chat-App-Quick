import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
const authMiddleware = (req:Request, res:Response, next:NextFunction) => {
    console.log("req headers", req.headers);    
    const authheader = req.headers.authorization;
    if(!authheader){
        return res.status(401).json({message: "user is not authorized"})
    }
    const token=authheader.split('')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{
        if(err){
            return res.status(401).json({message: "Unauthorized"})
        }
        req.user = user as AuthUser;
        next();
    })
    
  
}
export default authMiddleware;