const logger = require("../utils/logger");

const auth = (req, res, next) => {
  const adminKey = req.headers["x-admin-key"];
  
  if (!process.env.ADMIN_KEY) {
    // If no admin key is set, allow the request (dev mode)
    return next();
  }
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    logger("Unauthorized access attempt", { 
      ip: req.ip, 
      path: req.path 
    });
    
    const error = new Error("Unauthorized - Invalid or missing admin key");
    error.statusCode = 401;
    return next(error);
  }
  
  next();
};

module.exports = auth;
