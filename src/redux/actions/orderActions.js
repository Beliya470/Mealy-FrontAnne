import axiosInstance from '../../helpers/axiosConfig.js';



// Action types
export const FETCH_ORDERS_BEGIN = 'FETCH_ORDERS_BEGIN';
export const FETCH_ORDERS_SUCCESS = 'FETCH_ORDERS_SUCCESS';
export const FETCH_ORDERS_FAILURE = 'FETCH_ORDERS_FAILURE';

// Action creator to start the fetching process
export const fetchOrdersBegin = () => ({
    type: FETCH_ORDERS_BEGIN
});

// Action creator to handle the success of the fetch
export const fetchOrdersSuccess = orders => ({
    type: FETCH_ORDERS_SUCCESS,
    payload: { orders }
});

// Action creator to handle errors
export const fetchOrdersFailure = error => ({
    type: FETCH_ORDERS_FAILURE,
    payload: { error }
});

// This is the async action creator you've been trying to import.
// It dispatches the above action creators based on the result of the API call.
export const fetchOrders = () => {
    return dispatch => {
        dispatch(fetchOrdersBegin());

        // Here, replace with your actual API endpoint
        return axiosInstance.get('http://localhost:5000/orders')
            .then(response => {
                dispatch(fetchOrdersSuccess(response.data));
            })
            .catch(error => dispatch(fetchOrdersFailure(error)));
    };
};
