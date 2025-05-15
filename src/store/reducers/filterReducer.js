import actionTypes from '../actions/actionTypes';

const initialState = {
    filterValue: 'ALL',
};

const filterReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SET_FILTER_VALUE:
            return {
                ...state,
                filterValue: action.payload,
            };
        default:
            return state;
    }
};

export default filterReducer;