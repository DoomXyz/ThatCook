import jwt from 'jsonwebtoken';
require('dotenv').config();

const createJWT = (data, rememberMe) => {
  let token = null;
  if (data) {
    let payload = data;
    let key = process.env.JWT_SECRET;
    try {
      if (rememberMe === true) {
        token = jwt.sign(payload, key, {
          expiresIn: process.env.JWT_EXPIRES_IN_LONG,
        });
      } else {
        token = jwt.sign(payload, key, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
      }
    } catch (e) {
      console.log(e);
    }
  }
  return token;
};

const verifyJWT = (token) => {
  let key = process.env.JWT_SECRET;
  let decoded = null;
  try {
    decoded = jwt.verify(token, key);
  } catch (e) {
    console.log(e);
  }
  return decoded;
};

const clearCookie = (req, res) => {
  if (req.cookies && req.cookies.token) {
    res.clearCookie('token');
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
  if (cookies && cookies.token) {
    // let token = cookies.token;
    let token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    let decoded = verifyJWT(token);
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
  if (cookies && cookies.token) {
    // let token = cookies.token;
    let token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    let decoded = verifyJWT(token);
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
        errMessage: 'Invalid token!',
      });
    }
  } else {
    return res.status(401).json({
      errCode: -3,
      errMessage: 'No token provided!',
    });
  }
};

const checkVeterinarianJWT = (req, res, next) => {
  let cookies = req.cookies;
  if (cookies && cookies.token) {
    // let token = cookies.token;
    let token = req.cookies?.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    let decoded = verifyJWT(token);
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
        errMessage: 'Invalid token!',
      });
    }
  } else {
    return res.status(401).json({
      errCode: -3,
      errMessage: 'No token provided!',
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
