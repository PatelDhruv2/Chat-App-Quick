import jwt from 'jsonwebtoken';
import {Request, Response, NextFunction} from 'express';
const authMiddleware = (req:Request, res:Response, next:NextFunction) => { 
    const authheader = req.headers.authorization;
    console.log("Auth Header:", authheader);
    if(!authheader){
        return res.status(401).json({message: "user is not authorized"})
    }
    const token=authheader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user)=>{
        if(err){
            return res.status(401).json({message: "Unauthorized user"})
        }
        req.user = user as AuthUser;
        next();
    })
    
  
}
export default authMiddleware;