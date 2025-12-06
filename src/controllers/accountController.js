import accountService from '../services/accountService';
import { createJWT, verifyJWT } from '../middleware/jwtController';

const handleError = (res, e) => {
  console.log(e);
  return res.status(500).json({
    errCode: 3,
    errMessage: `Lỗi từ server: ${e.message}`,
    data: null,
  });
};
let handleVerifyToken = async (req, res) => {
  try {
    let Token = req.cookies.Token;
    let response = await accountService.verifyToken(Token);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleRegister = async (req, res) => {
  try {
    let response = await accountService.userRegister(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleLogin = async (req, res) => {
  try {
    let response = await accountService.userLogin(req.body);
    if (response.errCode === 0) {
      const isRememberLogin = req.body.rememberLogin
      let jwtToken = createJWT(response.data, isRememberLogin);
      response.Token = jwtToken;
      res.cookie('Token', jwtToken, {
        httpOnly: true,
        maxAge: isRememberLogin ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
      });
    }
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleLogout = async (req, res) => {
  try {
    let Token = req.cookies.Token;
    if (!Token) {
      res.clearCookie('Token');
      return res.status(200).json({
        errCode: -1,
        errMessage: 'Không có token để đăng xuất!',
        data: null,
      });
    }
    let data = verifyJWT(Token);
    let response = await accountService.userLogout(Token, data);
    res.clearCookie('Token');
    return res.status(200).json(response);
  } catch (e) {
    res.clearCookie('Token');
    return handleError(res, e);
  }
};
let handleGetAccountInfo = async (req, res) => {
  try {
    let response = await accountService.getAccountInfo(req.query.AccountID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
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
    return handleError(res, e);
  }
};
let handleChangeAccountInfo = async (req, res) => {
  try {
    let response = await accountService.changeAccountInfo(req.body);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleSendForgotToken = async (req, res) => {
  try {
    let response = await accountService.sendForgotToken(req.body.Email);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleVerifyForgotToken = async (req, res) => {
  try {
    let response = await accountService.verifyForgotToken(req.body.AccountID, req.body.Token);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleChangePassword = async (req, res) => {
  try {
    const { AccountID, Password, newPassword } = req.body;
    let response = await accountService.changePassword(AccountID, Password, newPassword);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleChangeAccountStatus = async (req, res) => {
  try {
    let response = await accountService.changeAccountStatus(req.body.AccountID, req.body.AccountStatus);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleGetVeterinarianInfo = async (req, res) => {
  try {
    let response = await accountService.getVeterinarianInfo(req.query.VeterinarianID);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleLoadVeterinarianInfo = async (req, res) => {
  try {
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 10 : parseInt(req.query.limit);
    const search = req.query.search || '';
    const filter = req.query.filter || 'ALL';
    const sort = req.query.sort || '0';
    let response = await accountService.loadVeterinarianInfo(page, limit, search, filter, sort);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleChangeWorkingStatus = async (req, res) => {
  try {
    const { VeterinarianID, WorkingStatus } = req.body;
    let response = await accountService.changeWorkingStatus(VeterinarianID, WorkingStatus);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
let handleLoadRoleAccount = async (req, res) => {
  try {
    let response = await accountService.loadRoleAccount(req.query.AccountType);
    return res.status(200).json(response);
  } catch (e) {
    return handleError(res, e);
  }
};
module.exports = {
  handleRegister,
  handleLogin,
  handleLogout,
  handleVerifyToken,
  handleGetAccountInfo,
  handleLoadAccountInfo,
  handleChangeAccountInfo,
  handleChangeAccountStatus,
  handleChangePassword,
  handleSendForgotToken,
  handleVerifyForgotToken,
  handleGetVeterinarianInfo,
  handleLoadVeterinarianInfo,
  handleChangeWorkingStatus,
  handleLoadRoleAccount,
};
