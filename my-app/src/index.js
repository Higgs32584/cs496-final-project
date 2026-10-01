import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter,Routes,Route} from "react-router-dom";

import App from './App';
import CreateSpeaker from './Pages/CreateSpeaker';
import UpcomingMeetings from './Pages/UpcomingMeetings';
import EditSpeaker from './Pages/EditSpeaker';

import CreateAccount from './Pages/CreateAccount';
import CreateMeeting from './Pages/CreateMeeting';
import CreateNewsPost from './Pages/CreateNewsPost';
import EditAccount from './Pages/EditAccount';

import Login from './Pages/Login';
import EditMeeting from './Pages/EditMeeting'
import EditNewsPost from './Pages/EditNewsPost'
import PastMeetings from './Pages/PastMeetings'
import NewsPage from './Pages/NewsPage'
import Speakers from './Pages/Speakers'
import CreationPage from './Pages/CreationPage'
import ViewNewsPost from './Pages/ViewNewsPost'
import ViewMeeting from './Pages/ViewMeeting'

import MeetingSearch from './Pages/MeetingSearch'

import RequireAdmin from './Components/RequireAdmin'
import { UserProvider } from './UserContext';
import './site_style.css';
import Jumbotron from './MainPage/Jumbotron';
import Navbar from './MainPage/Navbar';

/*
    the UserProvider wraps everything, so the navbar and all of the pages share
    the information of the logged-in user (see UserContext.js).

    pages that only admins can use are wrapped in RequireAdmin.
    pages for one specific item take its ID from the URL (the `:id` part),
    so they can be reloaded, bookmarked, and linked to.
*/
function NotFound()
{
    return (
        <div className='text-center mt-4'>
            <h1>Page not found</h1>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <UserProvider>
  <Jumbotron />
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<App/>}/>
      <Route path="/Home" element={<App/>}/>
      <Route path="/CreateAccount" element={<CreateAccount/>}/>
      <Route path="/EditAccount" element={<EditAccount/>}/>
      <Route path="/Login" element={<Login/>}/>
      <Route path="/Speakers" element={<Speakers/>}/>
      <Route path="/UpcomingMeetings" element={<UpcomingMeetings/>}/>
      <Route path="/PastMeetings" element={<PastMeetings/>}/>
      <Route path="/NewsPage" element={<NewsPage/>}/>
      <Route path="/MeetingSearch" element={<MeetingSearch/>}/>
      <Route path="/ViewNewsPost/:id" element={<ViewNewsPost/>}/>
      <Route path="/ViewMeeting/:id" element={<ViewMeeting/>}/>

      <Route path="/CreationPage" element={<RequireAdmin><CreationPage/></RequireAdmin>}/>
      <Route path="/CreateMeeting" element={<RequireAdmin><CreateMeeting/></RequireAdmin>}/>
      <Route path="/CreateSpeaker" element={<RequireAdmin><CreateSpeaker/></RequireAdmin>}/>
      <Route path="/CreateNewsPost" element={<RequireAdmin><CreateNewsPost/></RequireAdmin>}/>
      <Route path="/EditMeeting/:id" element={<RequireAdmin><EditMeeting/></RequireAdmin>}/>
      <Route path="/EditSpeaker/:id" element={<RequireAdmin><EditSpeaker/></RequireAdmin>}/>
      <Route path="/EditNewsPost/:id" element={<RequireAdmin><EditNewsPost/></RequireAdmin>}/>

      <Route path="*" element={<NotFound/>}/>
    </Routes>
  </BrowserRouter>
  </UserProvider>
  </React.StrictMode>
);
