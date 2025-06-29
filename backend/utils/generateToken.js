const jwt = require("jsonwebtoken");
const config = require("../config/authConfig");

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, config.secret, {
    expiresIn: config.jwtExpiration
  });
}

module.exports = generateToken;
