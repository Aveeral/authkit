const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dotenv = require("dotenv");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
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

    const decoded_idToken = await client.verifyIdToken({
        idToken: data.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = decoded_idToken.getPayload();

    const sub = payload.sub;
    const {rows} = await pool.query("SELECT * FROM oauth_accounts WHERE provider = $1 AND provider_user_id = $2",['google',sub]);

    if(!rows[0]){

        const email = payload.email;
        const info = await pool.query("SELECT * FROM users WHERE email = $1",[email]);
        const user = info.rows[0];

        if(!user){
            const {rows :newUserRows} = await pool.query("INSERT INTO users(email,password_hash) VALUES($1,$2) RETURNING *",[email,NULL]);
            const newUser = newUserRows[0];
            await pool.query("INSERT INTO oauth_accounts(provider,provider_user_id,user_id) VALUES($1,$2,$3)",['google',sub,newUser.id]);

            const accessToken = jwt.sign(
                  {userId: newUser.id, email: newUser.email },
                  process.env.JWT_SECRET,
                  { expiresIn: '15m' }
                );
            const refreshToken = crypto.randomBytes(64).toString('hex');
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            await pool.query("INSERT INTO refresh_tokens(user_id,token,expires_at) VALUES($1,$2,$3)",[newUser.id,refreshToken,expiresAt]);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            
            return res.status(201).json({message : "OAuth account created successfully!",accessToken});
        }
        else{
            return res.status(401).json({error: "Account already exists to link with google account please enter account password!"});
        } 
    }

    else{
       
        // Oauth account already exists just have to log the user in 
        const accessToken = jwt.sign(
            {email: payload.email, userId: rows[0].user_id},
            process.env.JWT_SECRET,
            {expiresIn: "15m"}
        )
        const refreshToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await pool.query("INSERT INTO refresh_tokens(user_id,token,expires_at) VALUES($1,$2,$3)",[rows[0].user_id,refreshToken,expiresAt]);

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({message : "Login Successful!",accessToken});
        
    }

    }catch(err){
        next(err);
    }

})

module.exports = router;