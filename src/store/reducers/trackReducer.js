import actionTypes from '../actions/actionTypes';

const initialState = {
    trackInfo: null,
};

const trackReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SAVE_TRACK_INFO:
            return {
                ...state,
                trackInfo: action.data.trackData,
            };
        case actionTypes.CLEAR_TRACK_INFO:
            return {
                ...state,
                trackInfo: null,
            };
        default:
            return state;
    }
};

export default trackReducer;