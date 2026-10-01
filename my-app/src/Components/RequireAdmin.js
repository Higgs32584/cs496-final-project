import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../UserContext';

/*
    wrapper for pages that only admins should see.
    the server checks this too, so this is only here to avoid showing
    a form that would fail when submitted.
*/
function RequireAdmin({ children })
{
    const { isAdmin, loading } = useUser();

    // wait until we know who is logged in before deciding
    if(loading)
    {
        return null;
    }

    if(!isAdmin)
    {
        return (
            <div className='text-center mt-4'>
                <h1>Admins only</h1>
                <p>You must be logged in as an admin to view this page.</p>
                <NavLink to="/Login" className="btn btn-primary">Login</NavLink>
            </div>
        );
    }

    return children;
}

export default RequireAdmin;
