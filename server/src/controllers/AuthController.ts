import { Request, Response } from 'express';
import prisma from "../config/db.config.js";
import jwt from "jsonwebtoken";
interface LoginPayloadType{
    name:string;
    email:string;
    provider:string;
    OAuthId:string;
    image:string;
}
class AuthController{
    static async getUser(req:Request, res:Response){
        try{
            const body:LoginPayloadType= req.body;
            let user= await prisma.user.findUnique({
                where:{
                    email:body.email
                }
                });
                if(!user){
                    user= await prisma.user.create({
                        data:{
                            name:body.name,
                            email:body.email,
                            provider:body.provider,
                            oauth_id:body.OAuthId,
                            image:body.image
                        }
                    });
                }
                let JWTPayload={
                    name:user.name,
                    email:user.email,
                    id:user.id
                }
                const token= jwt.sign(JWTPayload,process.env.JWT_SECRET_KEY as string,{
                    expiresIn:"1h"
                });
                 return res.status(200).json({
                    message:"User logged in successfully",
                    user:{
                        ...user,
                        token:`Bearer ${token}`
                    }
                 });
        }
        catch(err){
            res.status(500).json({message:err.message});
        }
    }
   
}
export default AuthController;