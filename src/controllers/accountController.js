import accountService from '../services/accountService';
import { createJWT, verifyJWT } from '../middleware/jwtController';

let handleRegister = async (req, res) => {
  try {
    let response = await accountService.userRegister(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleLogin = async (req, res) => {
  try {
    let response = await accountService.userLogin(req.body);
    if (response.errCode === 0) {
      let jwtToken = createJWT(response.data, req.body.rememberLogin);
      res.cookie('token', jwtToken, {
        httpOnly: true,
        maxAge: req.body.rememberLogin ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
      });
      return res.status(200).json(response);
    }
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleGetAccountInfo = async (req, res) => {
  try {
    let response = await accountService.getAccountInfo(req.query.accountid);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleLoadAccountInfo = async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 10 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    let response = await accountService.loadAccountInfo(page, limit, search, filter, sort);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleVerifyToken = async (req, res) => {
  try {
    let token = req.cookies.token;
    let response = await accountService.verifyToken(token);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleLogout = async (req, res) => {
  try {
    let token = req.cookies.token;
    if (!token) {
      res.clearCookie('token');
      return res.status(200).json({
        errCode: -1,
        errMessage: 'Không có token để đăng xuất!',
        data: null,
      });
    }
    let data = verifyJWT(token);
    let response = await accountService.userLogout(token, data);
    res.clearCookie('token');
    return res.status(response.errCode === 0 ? 200 : response.errCode === -1 ? 400 : 500).json(response);
  } catch (e) {
    console.log(e);
    res.clearCookie('token');
    return res.status(500).json({
      errCode: 1,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleChangeAccountStatus = async (req, res) => {
  try {
    let response = await accountService.changeAccountStatus(req.body.accountid, req.body.accountstatus);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleChangeAccountInfo = async (req, res) => {
  try {
    let response = await accountService.changeAccountInfo(req.body);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleChangePassword = async (req, res) => {
  try {
    const { accountid, password, newpassword } = req.body;
    let response = await accountService.changePassword(accountid, password, newpassword);
    return res.status(200).json(response);
  } catch (e) {
    console.log('Error in handleChangePassword: ', e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleGetPaymentInfo = async (req, res) => {
  try {
    let response = await accountService.getPaymentInfo(req.query.accountid);
    return res.status(response.errCode === 0 ? 200 : response.errCode === 2 ? 401 : response.errCode === 3 ? 500 : 400).json(response);
  } catch (e) {
    console.log('Error in handleGetPaymentInfo: ', e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleGetVeterinarianInfo = async (req, res) => {
  try {
    let response = await accountService.getVeterinarianInfo(req.query.accountid);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleSendForgotToken = async (req, res) => {
  try {
    let response = await accountService.sendForgotToken(req.body.email);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};
let handleVerifyForgotToken = async (req, res) => {
  try {
    let response = await accountService.verifyForgotToken(req.body.accountid, req.body.token);
    return res.status(200).json(response);
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      errCode: 3,
      errMessage: 'Lỗi từ server: ' + e.message,
      data: null,
    });
  }
};

module.exports = {
  handleRegister,
  handleLogin,
  handleGetAccountInfo,
  handleLoadAccountInfo,
  handleVerifyToken,
  handleLogout,
  handleChangeAccountStatus,
  handleChangeAccountInfo,
  handleChangePassword,
  handleGetPaymentInfo,
  handleGetVeterinarianInfo,
  handleSendForgotToken,
  handleVerifyForgotToken,
};
