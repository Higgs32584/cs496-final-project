import React, {useEffect} from 'react';
import api from '../api';
import MeetingList from '../Components/MeetingList';

function PastMeetings()
{
    const [meetings,setMeetings] = React.useState([]);

    useEffect(() => {

        api.get("/pastmeetings")
        .then((response) => {
            setMeetings(response.data);
        })
        .catch((error) => {
            console.log('error in past meetings GET request');
            console.log(error);
        });

    }, []);

    // Remove a deleted meeting from the meetings array in the state
    const removeMeeting = (meetingID) => {
        setMeetings(current => current.filter(meeting => meeting._id !== meetingID));
    };

    return(
    <div className="d-flex justify-content-center align-items-center">
        <div className="col-12">

        {/*page header*/}
        <div style={{ backgroundColor: '#B71429' }}>
          <header className="mt-2 p-4 text-white text-center rounded">
            <h1 style={{ fontWeight: 700, color: '#ffffff' }}> Past meetings </h1>
          </header>
        </div>

        <div className="d-flex justify-content-center align-items-center">
        {/* statement that checks for meetings. If they're there, display them. If not, show that there are
            no meetings */}
        {meetings && meetings.map && (meetings.length > 0) ?
            <MeetingList meetings={meetings} color='#B71429' onDeleted={removeMeeting} />
            :
            <h1>No Meetings Found</h1>
        }
        </div>

        </div>
    </div>
    );

}

export default PastMeetings;
