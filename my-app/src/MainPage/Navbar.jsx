import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../api';
import { useUser } from '../UserContext';
import '../App.css'
function Navbar()
{
    /*
        the navbar changes when a user logs in or out. the user comes from
        the UserContext, so it updates as soon as that happens.
    */
    const { user, isAdmin, setUser } = useUser();
    const navigate = useNavigate();

    /*
        function to log the user out
    */
    function logout(event)
    {
        event.preventDefault();

        api.get('/logout')
        .catch((error) => {
            // a 409 means the session was already gone, which is fine
            console.log(error);
        })
        .finally(() => {
            setUser(null);
            navigate('/Home');
        });
    }

    return (
    <nav className="navbar navbar-expand-sm">
    <div className="container-fluid">
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainMenu" aria-label="Toggle navigation">
        <span className="bi-grid-1x2-fill"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainMenu">

            <ul className="navbar-nav">
                <li className="nav-item">
                    <NavLink to="/" className="fancy_link">Home</NavLink>
                </li>

                <li className="nav-item">
                    <NavLink to="/UpcomingMeetings" className="fancy_link">Upcoming Meetings</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/PastMeetings" className="fancy_link">Past Meetings</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/Speakers" className="fancy_link">Speakers</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/NewsPage" className="fancy_link">News & Events</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/MeetingSearch" className="fancy_link">Search Meetings</NavLink>
                </li>


                {/*check if the user is logged in. if they are, then change these buttons to 'logout'*/}
                {user && user.username ?
                <>
                    <li className="nav-item">
                        <NavLink to="/EditAccount" className="fancy_link">Account</NavLink>
                    </li>
                    <li className="nav-item">
                        <a href="/Home" onClick={logout} className="fancy_link">Logout</a>
                    </li>
                    {isAdmin ?
                        <li className="nav-item">
                            <NavLink to="/CreationPage" className="fancy_link">Manage Site</NavLink>
                        </li>
                        :
                        <></>
                    }
                </>
                : // if the user is not logged in, render the 'create account' and 'login' buttons
                <>
                    <li className="nav-item">
                        <NavLink to="/CreateAccount" className="fancy_link">Register</NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink to="/Login" className="fancy_link">Login</NavLink>
                    </li>
                </>
                }
            </ul>

        </div>
    </div>
    </nav>
    );
};

export default Navbar;
