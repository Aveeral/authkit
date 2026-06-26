const crypto = require("crypto");
const pool = require("../db.js");

async function authenticateApiKeys(req,res,next){
    try{

    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({error : "authHeader not provided!"});
    }
    
    if(authHeader.split(" ").length !== 2 || authHeader.split(" ")[0] !== "Bearer"){
        return res.status(401).json({error : "Invalid authHeader!"});
    }

    const apiKey = authHeader.split(" ")[1];
    const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const {rows} = await pool.query("SELECT user_id,id,name,scopes FROM api_keys WHERE key_hash = $1",[apiKeyHash]);

    if(!rows[0]){
        return res.status(404).json({error : "Api Key not found!"});
    }

    await pool.query("UPDATE api_keys SET last_used_at = NOW() WHERE id = $1", [rows[0].id]);
    
    req.user = rows[0];
    next();

    }catch(err){
        next(err);
    }

}

module.exports = authenticateApiKeys;