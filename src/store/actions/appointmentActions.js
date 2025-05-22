import actionTypes from './actionTypes';

export const saveAppointmentForCheckout = (appointmentData) => ({
    type: actionTypes.SAVE_APPOINTMENT_CHECKOUT,
    data: { appointmentData },
});

export const clearAppointmentCheckout = () => ({
    type: actionTypes.CLEAR_APPOINTMENT_CHECKOUT,
});