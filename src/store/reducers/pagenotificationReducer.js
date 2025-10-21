import actionTypes from '../actions/actionTypes';

const initialState = {
    notification: null,
};

const pagenotificationReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.ADD_NOTIFICATION:
            return {
                ...state,
                notification: action.data,
            };
        case actionTypes.CLEAR_NOTIFICATION:
            return {
                ...state,
                notification: null,
            };
        default:
            return state;
    }
};

export default pagenotificationReducer;