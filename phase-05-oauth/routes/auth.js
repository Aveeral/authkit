const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config();


router.get("/google", async (req,res,next) => {
    try{
        
        const state = crypto.randomBytes(64).toString('hex');
        const code_verifier = crypto.randomBytes(32).toString('base64url');
        const code_challenge = crypto.createHash('sha256').update(code_verifier).digest('base64url');

        req.session.state = state;
        req.session.code_verifier = code_verifier;

        const client_id = process.env.GOOGLE_CLIENT_ID;
        const redirect_uri = process.env.GOOGLE_REDIRECT_URI;
        
        const url = `https://accounts.google.com/o/oauth2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=openid%20email%20profile&state=${state}&code_challenge=${code_challenge}&code_challenge_method=S256`;
        return res.redirect(url);


    }catch(err){
        next(err);
    }
})

router.get("/google/callback", async (req,res,next) => {

    try{

    const state = req.query.state;
    if(!state){
        return res.status(404).json({error : "state not found!"});
    }
    if(state != req.session.state){
        return res.status(401).json({error : "  Invalid state"});
    }

    const authCode = req.query.code;
    if(!authCode){
        return res.status(404).json({error : "Code not found!"});
    }
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
        method: "POST",
        headers: {
        "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
        code: authCode,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code_verifier: req.session.code_verifier
        })
    });

    if(!response.ok){
        return res.status(401).json({error: "Token exchange failed!"});
    }

    const data = await response.json();       

    }catch(err){
        next(err);
    }

})