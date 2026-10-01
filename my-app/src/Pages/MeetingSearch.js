import React from 'react';
import api from '../api';
import MeetingList from '../Components/MeetingList';

function MeetingSearch(){
    // undefined until a search has been made
    const [meetings,setMeetings] = React.useState();
    const [query, setQuery] = React.useState('');

    const handleSearch = (e) => {
        e.preventDefault();

        api.post('/searchmeetings', {search: query})
        .then((response)=>{
            setMeetings(response.data || []);
        })
        .catch((error)=>{
            // the server answers with a 404 when no meetings match
            setMeetings([]);
        })
    }

    // Remove a deleted meeting from the meetings array in the state
    const removeMeeting = (meetingID) => {
        setMeetings(current => current.filter(meeting => meeting._id !== meetingID));
    };

    return(
        <div className="d-flex justify-content-center align-items-center">
        <div className='col-12'>
            <div style={{ backgroundColor: '#0F527F' }}>
              <header className="mt-2 p-4 text-white text-center rounded">
                <h1 style={{ fontWeight: 700, color: '#ffffff' }}> Search Meetings </h1>
              </header>
            </div>


            <div className='d-flex justify-content-center align-items-center'>
                <div className='col-lg-4'>
                <form onSubmit={handleSearch}>
                    <div className='d-flex flex-row'>
                        <div className='p-2'>
                        <label htmlFor='searchQuery'>Search: </label>
                        </div>
                        <div className='p-2'>
                        <input type='text' className='form-control' id='searchQuery' required value={query} onChange={(e)=>setQuery(e.target.value)} />
                        </div>
                        <div className='p-2'>
                        <button type="submit" className="btn btn-primary">Submit</button>
                        </div>
                    </div>
                </form>
                </div>
            </div>

            <div className='d-flex justify-content-center align-items-center'>
            <div className='col-12 col-lg-8'>
            {meetings && meetings.map && (meetings.length > 0) ?
                <MeetingList meetings={meetings} color='#0F527F' onDeleted={removeMeeting} />
            :
                <>
                {meetings && meetings.map && (meetings.length === 0) ?
                    <div className='d-flex justify-content-center align-items-center'>
                    <h1>No Meetings</h1>
                    </div>
                :
                    <div className='d-flex justify-content-center align-items-center'>
                    <h1>Search for Meetings</h1>
                    </div>
                }
                </>
            }
            </div>
            </div>


        </div>
        </div>
    );
}

export default MeetingSearch;
