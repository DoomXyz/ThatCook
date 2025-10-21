import actionTypes from './actionTypes';

export const userLogin = (userInfo) => ({
  type: actionTypes.USER_LOGIN_SUCCESS,
  data: userInfo,
});

export const userLogout = () => ({
  type: actionTypes.USER_LOGOUT,
});