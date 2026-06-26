const express = require("express");
const router = express.Router();
const pool = require("../db");
const crypto = require('crypto');
const authenticate = require("../middleware/authenticate.js");
const authenticateApiKeys = require("../middleware/authenticateApiKeys");


router.post("/",authenticate, async (req,res,next) => {
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

router.get("/",authenticate, async (req,res,next) => {
    try{

       const user = req.user;
       if(!user){
        return res.status(401).json({error : "User not found!"});
       }

       const user_id = user.userId;
       const {rows} = await pool.query("SELECT id,name,scopes FROM api_keys WHERE user_id = $1",[user_id]);
       if(!rows){
        return res.status(404).json({error : "No API keys found!"});
       }

       return res.status(200).json({keys : rows});
       
    }catch(err){
        next(err);
    }
})

router.delete("/:id",authenticate, async (req,res,next) => {
    try{

        const user = req.user;
        if(!user){
            return res.status(401).json({error : "User not found!"});
        }
        const id = req.params.id;

        const { rows } = await pool.query(
        "DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id",
        [id, user.userId]
        );

        if (!rows[0]) {
        return res.status(404).json({ error: "Key not found!" });
        } 

        return res.status(200).json("Deletion successful!");

    }catch(err){
        next(err);
    }
})

router.get("/dashboard",)

module.exports = router;
