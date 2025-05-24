import actionTypes from './actionTypes';

export const savePreselectInfo = (type, selectedID) => ({
    type: actionTypes.SAVE_PRESELECT_INFO,
    data: { type, selectedID },
});

export const clearPreselectInfo = () => ({
    type: actionTypes.CLEAR_PRESELECT_INFO,
});