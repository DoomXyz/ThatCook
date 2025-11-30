import jwt from 'jsonwebtoken';
require('dotenv').config();

const createJWT = (data, rememberMe) => {
  let Token = null;
  if (data) {
    let payload = data;
    let key = process.env.JWT_SECRET;
    try {
      if (rememberMe === true) {
        Token = jwt.sign(payload, key, {
          expiresIn: process.env.JWT_EXPIRES_IN_LONG,
        });
      } else {
        Token = jwt.sign(payload, key, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
  return Token;
};

const verifyJWT = (Token) => {
  let key = process.env.JWT_SECRET;
  let decoded = null;
  try {
    decoded = jwt.verify(Token, key);
  } catch (e) {
    console.log(e);
  }
  return decoded;
};

const clearCookie = (req, res) => {
  if (req.cookies && req.cookies.Token) {
    res.clearCookie('Token');
    return res.status(200).json({
      errCode: 0,
      message: 'Cookie has been cleared successfully!',
    });
  } else {
    return res.status(400).json({
      errCode: -1,
      message: 'No cookie found to clear!',
    });
  }
};

const checkAdminJWT = (req, res, next) => {
  let cookies = req.cookies;
  if (cookies && cookies.Token) {
    // let Token = cookies.Token;
    let Token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    let decoded = verifyJWT(Token);
    if (decoded) {
      if (decoded.AccountType && decoded.AccountType === 'A') {
        next();
      } else {
        return res.status(401).json({
          errCode: -1,
          errMessage: 'Not authenticated the user!',
        });
      }
    } else {
      return res.status(401).json({
        errCode: -2,
        errMessage: 'Not authenticated the user!',
      });
    }
  } else {
    return res.status(401).json({
      errCode: -3,
      errMessage: 'Not authenticated the user!',
    });
  }
};

const checkOwnerJWT = (req, res, next) => {
  let cookies = req.cookies;
  if (cookies && cookies.Token) {
    // let Token = cookies.Token;
    let Token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    let decoded = verifyJWT(Token);
    if (decoded) {
      if (decoded.AccountType && decoded.AccountType === 'O') {
        next();
      } else {
        return res.status(401).json({
          errCode: -1,
          errMessage: 'Not authorized! Owner access required.',
        });
      }
    } else {
      return res.status(401).json({
        errCode: -2,
        errMessage: 'Invalid Token!',
      });
    }
  } else {
    return res.status(401).json({
      errCode: -3,
      errMessage: 'No Token provided!',
    });
  }
};

const checkVeterinarianJWT = (req, res, next) => {
  let cookies = req.cookies;
  if (cookies && cookies.Token) {
    // let Token = cookies.Token;
    let Token = req.cookies?.Token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    let decoded = verifyJWT(Token);
    if (decoded) {
      if (decoded.AccountType && decoded.AccountType === 'V') {
        next();
      } else {
        return res.status(401).json({
          errCode: -1,
          errMessage: 'Not authorized! Veterinarian access required.',
        });
      }
    } else {
      return res.status(401).json({
        errCode: -2,
        errMessage: 'Invalid Token!',
      });
    }
  } else {
    return res.status(401).json({
      errCode: -3,
      errMessage: 'No Token provided!',
    });
  }
};

module.exports = {
  createJWT,
  verifyJWT,
  clearCookie,
  checkAdminJWT,
  checkOwnerJWT,
  checkVeterinarianJWT,
};
