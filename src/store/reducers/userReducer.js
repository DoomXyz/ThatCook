import actionTypes from '../actions/actionTypes';

const initialState = {
  userInfo: null,
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.USER_LOGIN_SUCCESS:
      return {
        ...state,
        userInfo: action.data,
      };
    case actionTypes.USER_LOGOUT:
      return {
        ...state,
        userInfo: null,
      };
    default:
      return state;
  }
};

export default userReducer;
