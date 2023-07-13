const User = require('../models/User');
const Task = require('../models/Task');
const asyncHandler=require('express-async-handler')
const bcrypt=require('bcrypt');



const getAllUsers=asyncHandler (async (req, res)=>{
    const users= await User.find().select('-password').lean()
    if(!users?.length){
        return res.status(400).json({message: 'No users found'})
    }
   return res.json(users)
})


const createNewUser=asyncHandler (async (req, res)=>{
    const {username, password, roles}=req.body;
    //confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length){
        return res.status(400).json({
            message: "All fields are required"
        })
    }

    //check for duplicate
    const duplicate= await User.findOne({username}).collation({ locale: 'en', strength: 2 }).lean().exec(); //exec is for this async stuff
    if(duplicate){
        return res.status(400).json({message:"Duplicate username!"})
    }

    //hash password
    const hashedPwd= await bcrypt.hash(password, 10);
    const userObject={username, "password": hashedPwd, roles}

    //create and store new user
    const user= await User.create(userObject);

    if(user){ // created{
        res.status(201).json({message: `New User ${username} created` });
    }else{
        res.status(400).json({message:'Invalid user data received'})
    }
})

const updateUser=asyncHandler (async (req, res)=>{
    const {id, username, roles, active, password}=req.body;

    //confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active!=="boolean"){
        return res.status(400).json({message: "All fields are required"});
    }
    const user= await User.findById(id).exec();
    if(!user){
        return res.status(400).json({message: 'User not found'});
    }
    //check for duplicates
    const duplicate= await User.findOne({username}).lean().exec();
    if(duplicate && duplicate._id.toString()!==id){
        return res.status(409).json({message: 'Duplicate username'})
    }

    user.username=username;
    user.roles=roles;
    user.active=active;
    if(password){
        //hash passwrod
        user.password= await bcrypt.hash(password, 10);
    }
    const updateUser= await user.save();
    res.json({message: `Updated username ${updateUser.username}`})
})

const deleteUser=asyncHandler (async (req, res)=>{
    const {id}= req.body;
    if(!id){
        return res.status(400).json({message: "User Id required"})
    }
    const tasks= await Task.findOne({user: id}).lean().exec();

    if(tasks?.length){
        return res.status(400).json({message: "User has assigned tasks" })
    }

    const user= await User.findById(id).exec();
  
    if(!user){
        return res.status(400).json({message: "User not found"});
    }

    const result= await user.deleteOne();
    const reply= `Username ${result.username} with ID ${result._id} deleted`;

    res.json(reply)
})

module.exports={getAllUsers, createNewUser, updateUser, deleteUser}