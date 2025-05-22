import actionTypes from '../actions/actionTypes';

const initialState = {
    billInfo: null,
};

const billReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SAVE_BILL_SEARCH:
            return {
                ...state,
                billInfo: action.data.billData,
            };
        case actionTypes.CLEAR_BILL_SEARCH:
            return {
                ...state,
                billInfo: null,
            };
        default:
            return state;
    }
};

export default billReducer;