import actionTypes from '../actions/actionTypes';

const initialState = {
    appointmentCheckout: null,
    fuAppointmentInfo: null,
};

const appointmentReducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.SAVE_APPOINTMENT_CHECKOUT:
            return {
                ...state,
                appointmentCheckout: {
                    appointmentData: action.data.appointmentData,
                },
            };
        case actionTypes.CLEAR_APPOINTMENT_CHECKOUT:
            return {
                ...state,
                appointmentCheckout: null,
            };
        case actionTypes.SAVE_FUAPPOINTMENT_INFO:
            return {
                ...state,
                fuAppointmentInfo: action.data,
            };
        case actionTypes.CLEAR_FUAPPOINTMENT_INFO:
            return {
                ...state,
                fuAppointmentInfo: null,
            };
        default:
            return state;
    }
};

export default appointmentReducer;