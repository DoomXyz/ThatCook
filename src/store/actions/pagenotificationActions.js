import actionTypes from './actionTypes';

export const addNotification = (message) => ({
    type: actionTypes.ADD_NOTIFICATION,
    data: message,
});

export const clearNotification = () => ({
    type: actionTypes.CLEAR_NOTIFICATION,
});