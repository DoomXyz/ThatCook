import actionTypes from './actionTypes';

export const saveAppointmentForCheckout = (appointmentData) => ({
    type: actionTypes.SAVE_APPOINTMENT_CHECKOUT,
    data: { appointmentData },
});

export const clearAppointmentCheckout = () => ({
    type: actionTypes.CLEAR_APPOINTMENT_CHECKOUT,
});

export const saveFuAppointmentInfo = (fuAppointmentData) => ({
    type: actionTypes.SAVE_FUAPPOINTMENT_INFO,
    data: fuAppointmentData,
});

export const clearFuAppointmentInfo = () => ({
    type: actionTypes.CLEAR_FUAPPOINTMENT_INFO,
});