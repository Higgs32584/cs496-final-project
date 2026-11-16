import React, {useEffect} from 'react';
import {useParams, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useUser } from '../UserContext';
import { imageSrc } from '../util';

function ViewMeeting(){

    const [meeting, setMeeting] = React.useState();
    const [isLoading, setIsLoading] = React.useState(true);
    const { isAdmin } = useUser();

    // the ID of the meeting comes from the URL, so the page can be linked to directly
    const { id: meetingID } = useParams();
    const navigate = useNavigate();


    const toEditPage = (meetingID) => {
        navigate('/EditMeeting/' + meetingID);
    }


    const handleDelete = (meetingID) => {
      let confirmDelete = window.confirm("Are you sure you want to delete this meeting? This cannot be undone.");
      if(confirmDelete)
      {
        api.delete(`/meeting/${meetingID}`)
        .then(() => {
            navigate('/Home');
        })
        .catch((error) => {
            console.log(error);
            window.alert(errorMessage(error, 'Could not delete the meeting.'));
        });
      }
    };


    /*
        get the info for the meeting from the data
    */
    useEffect(() => {

        api.get("/meeting/" + meetingID)
        .then((response) => {
            setMeeting(response.data);
            setIsLoading(false);
        })
        .catch((error) => {
            console.log('error in meeting GET request');
            console.log(error);
            setIsLoading(false);
        });

    }, [meetingID]);


    return(
        <div className='d-flex justify-content-center align-items-center'>

            {isLoading ?
                <div>
                    <h1>Loading...</h1>
                </div>
            :
                <div>
                    {meeting ?
                        <div>
                            <h1 style={{fontWeight: 400, textDecoration:'underline'}}>{meeting.topic}</h1>
                            {isAdmin ?
                            <>
                                <button
                                    className="btn"
                                    style={{backgroundColor:'#0F527F', color:'#ffffff'}}
                                    onClick={()=>{toEditPage(meeting._id)}}>
                                Edit
                                </button>

                                <span> </span>

                                <button
                                    className="btn"
                                    style={{backgroundColor:'#0F527F', color:'#ffffff'}}
                                    onClick={()=>{handleDelete(meeting._id)}}>
                                Delete
                                </button>
                                <span> </span>

                            </>
                            :
                            <></>
                            }


                            <div className='row'>
                                <div className='col-12 col-lg-8'>
                                    <p><span style={{fontWeight: 700}}>Date:</span> {new Date(meeting.date).toDateString()}</p>
                                    <p><span style={{fontWeight: 700}}>Time:</span> {new Date(meeting.date).toLocaleTimeString()}</p>
                                    <p><span style={{fontWeight: 700}}>Location:</span> {meeting.location}</p>
                                    <p><span style={{fontWeight: 700}}>Speaker:</span> {meeting.speaker}</p>
                                    <p style={{fontWeight: 700}}>Description:</p>
                                    <p style={{whiteSpace:'pre-wrap'}}> {meeting.content} </p>
                                </div>

                                <div className='col-12 col-lg-4'>
                                {/* check to see if there is an image included with this meeting. if so, display it. */
                                imageSrc(meeting.img) ?
                                    <img alt={meeting.topic} src={imageSrc(meeting.img)} style={{maxHeight:400, maxWidth:'100%'}}/>
                                    :
                                    <></>
                                }

                                </div>
                            </div>

                        </div>
                    :
                        <div>
                            <h1>Meeting not found</h1>
                        </div>
                    }
                </div>
            }

        </div>


    );

}

export default ViewMeeting;
