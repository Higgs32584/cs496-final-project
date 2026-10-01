import axios from 'axios';

/*
    the one place that knows where the server is.
    set REACT_APP_API_URL (in `my-app/.env`) to point the site at a different server.
*/
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/*
    every request to the server should go through this instead of plain `axios`.
    `withCredentials` sends the session cookie along, which the server needs
    to know who is logged in. without it, anything only admins can do fails with a 401.
*/
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

/* the message to show a user when a request fails */
export function errorMessage(error, fallback)
{
    if(error.response && error.response.data && error.response.data.msg)
    {
        return error.response.data.msg;
    }
    if(error.response && error.response.status === 401)
    {
        return 'You must be logged in as an admin to do that.';
    }
    if(!error.response)
    {
        return 'Could not reach the server. Please try again later.';
    }
    return fallback || 'Something went wrong. Please try again.';
}

export default api;
