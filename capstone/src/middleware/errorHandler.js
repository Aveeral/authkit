const {NODE_ENV} = require("../config/env.js");

class AppError extends Error {
    constructor(message, status) {
        super(message); 
        this.status = status; 
    }
}

const errorHandler = (err, req, res, next) => {
  if(NODE_ENV == "development"){
    console.error(err.stack);
  }
  
  const status = err.status || 500;
  let message;
  
    if (err instanceof AppError){
        message = err.message;
    } else if (NODE_ENV === 'production') {
        message = 'Internal server error';
    } else {
         message = err.message;
    }   
  
  res.status(status).json({ error: message });
};