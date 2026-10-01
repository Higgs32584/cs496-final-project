import React from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useUser } from '../UserContext';
import { imageSrc } from '../util';

/*
    the list of meetings shown on the upcoming, past, and search pages.
    props:
        meetings - array of meetings to show
        color - the color for the buttons, to match the page header
        onDeleted - function that accepts the ID of a meeting after it is deleted,
                    so the page can remove it from its list
*/
function MeetingList(props)
{
    const navigate = useNavigate();
    const { isAdmin } = useUser();

    const toEditPage = (meetingID) => {
        navigate('/EditMeeting/' + meetingID);
    }

    const toViewPage = (meetingID) => {
        navigate('/ViewMeeting/' + meetingID);
    }

    const handleDelete = (meetingID) => {
      let confirmDelete = window.confirm("Are you sure you want to delete this meeting? This cannot be undone.");
      if(confirmDelete)
      {
        api.delete(`/meeting/${meetingID}`)
        .then(() => {
            props.onDeleted(meetingID);
        })
        .catch((error) => {
            console.log(error);
            window.alert(errorMessage(error, 'Could not delete the meeting.'));
        });
      }
    };

    return (
        <ul>
        {props.meetings.map((meeting) => (
            <li className="page_li" key={meeting._id}>
                <div className='row'>
                    <div className='col-lg-10'>
                        {/* buttons for editing or deleting a meeting. only appear to logged-in admins */}
                        {isAdmin ?
                        <>
                            <button className="btn" style={{backgroundColor:props.color}} onClick={()=>{toEditPage(meeting._id)}}> Edit </button>
                        <span> </span>
                            <button className="btn" style={{backgroundColor:props.color}} onClick={()=>{handleDelete(meeting._id)}}> Delete </button>
                        <span> </span>
                        </>
                        :
                        <></>
                        }
                        <button className="btn" style={{backgroundColor:props.color}} onClick={()=>{toViewPage(meeting._id)}}> View </button>
                        {/* layout for the meeting itself. */}
                        <p><span style={{fontWeight: 700}}>Date:</span> {new Date(meeting.date).toDateString()}</p>
                        <p><span style={{fontWeight: 700}}>Time:</span> {new Date(meeting.date).toLocaleTimeString()}</p>
                        <p><span style={{fontWeight: 700}}>Topic:</span> {meeting.topic}</p>
                        <p><span style={{fontWeight: 700}}>Speaker:</span> {meeting.speaker}</p>
                        <p style={{fontWeight: 700}}>Description:</p>
                        <p className='d-inline-block text-truncate'
                            style={{overflow:'hidden',
                                    maxWidth: '100%',
                                    textOverflow:'ellipsis'}}>
                        {meeting.content}
                        </p>
                    </div>
                    {/* check to see if there is an image included with this meeting. if so, display it.
                        the image size is set to be really small so that it doesn't take up a huge portion of the page.*/
                    imageSrc(meeting.img) ?
                    <div className='col-lg-2'>
                        <img alt={meeting.topic} src={imageSrc(meeting.img)} style={{width:150, maxWidth:'100%'}}/>
                    </div>
                    :
                    <></>
                    }
                </div>
            </li>
        ))}
        </ul>
    );
}

export default MeetingList;
