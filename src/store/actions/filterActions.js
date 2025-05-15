import actionTypes from './actionTypes';

export const setFilterValue = (filterValue) => ({
    type: actionTypes.SET_FILTER_VALUE,
    payload: filterValue,
});