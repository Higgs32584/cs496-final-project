import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from './api';

/*
    keeps track of the logged-in user for the whole site.
    the server is asked once, when the site loads, and every page and the navbar
    share the answer. that way logging in or out updates everything at once,
    without having to reload the page.

    to use it in a component:
        const { user, isAdmin } = useUser();
*/
const UserContext = createContext({
    user: null,
    isAdmin: false,
    loading: true,
    setUser: () => {}
});

export function UserProvider({ children })
{
    const [user, setUser] = useState(null);
    // true until the server has answered whether somebody is logged in
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(() => {
        return api.get('/getlogged')
        .then((response) => {
            setUser(response.data);
        })
        .catch(() => {
            // a 401 here just means that nobody is logged in
            setUser(null);
        })
        .finally(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const value = {
        user: user,
        isAdmin: Boolean(user && user.admin === 1),
        loading: loading,
        setUser: setUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser()
{
    return useContext(UserContext);
}
