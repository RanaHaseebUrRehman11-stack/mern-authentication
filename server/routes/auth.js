const express=require("express");
const router=express.Router();
const User=require("../models/user");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");
const authMiddleware=require("../middleware/auth");

router.post("/register",async(req,res)=>{
    try{
        const {username,email,password}= req.body;

        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"user already exists"});
        }
        const user=new User({username,email,password});
        await user.save();
        res.status(201).json({message:"user registered successfully"});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message:"internal server error"});
    }

});
router.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"invalid email or password"});
        }
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"invalid email or password"});
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"});
        res.status(200).json({
            message:"Login successful",
            token:token
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({message:"internal server error"});
    }
});
router.get("/profile",authMiddleware,async(req,res)=>{
    try{
        const user=await User.findById(req.user.id).select("-password");
        if(!user){
            return res.status(404).json({message:"user not found"});
        }
        res.status(200).json({user});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message:"internal server error"});
    }
});
module.exports=router;
