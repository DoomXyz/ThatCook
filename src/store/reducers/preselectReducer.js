const initialState = {
    appointmentPreselect: null,
    serviceType: 1,
};

const preselectReducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SAVE_PRESELECT_INFO':
            return {
                ...state,
                appointmentPreselect: {
                    type: action.data.type,
                    selectedID: action.data.selectedID,
                },
            };
        case 'CLEAR_PRESELECT_INFO':
            return {
                ...state,
                appointmentPreselect: null,
            };
        case 'SELECT_SERVICE_TYPE':
            return {
                ...state,
                serviceType: action.serviceType,
            };
        default:
            return state;
    }
};

export default preselectReducer;