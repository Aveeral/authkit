const express = require("express");
const router = express.Router();
const pool = require("../db");
const crypto = require('crypto');


router.post("/", async (req,res,next) => {
    try{

    const user = req.user;
    if(!user){
        return res.status(401).json({error : "User not found!"});
    }
    
    const user_id = user.userId;
    const apiKey = crypto.randomBytes(64).toString('hex');
    const {name,scopes} = req.body;
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    await pool.query("INSERT INTO api_keys(user_id,name,scopes,key_hash) VALUES($1,$2,$3,$4)",
        [user_id,name,scopes,apiKeyHash]
    );

    return res.status(201).json({message : "API key created successfully!Please copy the api key.We will only show it once",apiKey});

    }catch(err){
        next(err);
    }

})

router.get("/", async (req,res,next) => {
    try{
        
    }catch(err){
        next(err);
    }
})
