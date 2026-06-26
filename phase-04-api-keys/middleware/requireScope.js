function requireScope(reqScope){
    return async (req,res,next) => {
    try{

    const scopes = req.user.scopes;
    if(!scopes){
        return res.status(404).json({error : "Scopes not found!"});
    }

    for(let i=0;i<scopes.length;i++){
        if(scopes[i] === reqScope){
            next();
            return;
        }
    }
    return res.status(403).json({error : "Unauthorized!"});
    next();

    }catch(err){
        next(err);
    }
}

}