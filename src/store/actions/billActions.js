import actionTypes from './actionTypes';

export const saveBillSearchInfo = (billData) => ({
    type: actionTypes.SAVE_BILL_SEARCH,
    data: { billData },
});

export const clearBillSearchInfo = () => ({
    type: actionTypes.CLEAR_BILL_SEARCH,
});