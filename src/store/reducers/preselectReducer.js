const initialState = {
    appointmentPreselect: null,
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
        default:
            return state;
    }
};

export default preselectReducer;