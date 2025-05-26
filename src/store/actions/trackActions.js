import actionTypes from './actionTypes';

export const saveTrackInfo = (trackData) => ({
    type: actionTypes.SAVE_TRACK_INFO,
    data: { trackData },
});

export const clearTrackInfo = () => ({
    type: actionTypes.CLEAR_TRACK_INFO,
});