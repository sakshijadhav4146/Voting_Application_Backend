const jwt = require("jsonwebtoken");

const jwtMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) return res.status(401).json({ error: "Token not found" });
  const token = req.headers.authorization.split(' ')[1];
  if (!token) return res.status(401).json({error:"Unauthorized"})

  try {
    const verifyToken = jwt.verify(token, process.env.SECRET_KEY); 
    req.user = verifyToken;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid Token", error: err });
  }
};

const generateToken = (userData) => {
  return jwt.sign(userData, process.env.SECRET_KEY);
};

module.exports = {
  jwtMiddleware,
  generateToken,
};
