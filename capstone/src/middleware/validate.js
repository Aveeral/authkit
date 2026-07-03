const {AppError} = require("./errorHandler.js");
const {z} = require("zod");

function validate(schema){
    return (req,res,next) => {
        const result = schema.safeParse(req.body);

        if(result.success){
            req.body = result.data;
            return next();
        }
        
            const message = result.error.errors.map(e => `${e.path} : ${e.message}`).join(", ");
            return next(new AppError(message,400));
        
    }
}

module.exports = validate;

