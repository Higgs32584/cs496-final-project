import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useUser } from '../UserContext';

function Speakers() {
  const navigate = useNavigate();
  const [speakers, setSpeakers] = useState([]);
  const { isAdmin } = useUser();

  const toEditPage = (speakerID) => {
    navigate('/EditSpeaker/' + speakerID);
  };
  const handleDelete = (speakerID) => {
    let confirmDelete = window.confirm("Are you sure you want to delete this speaker? This cannot be undone.");
    if(confirmDelete)
    {
        api.delete(`/speaker/${speakerID}`)
        .then(() => {
            setSpeakers(current => current.filter(speaker => speaker._id !== speakerID));
        })
        .catch((error) => {
            console.log(error);
            window.alert(errorMessage(error, 'Could not delete the speaker.'));
        });
    }
  }

  useEffect(() => {
    api.get('/allspeakers')
    .then((response) => {
      setSpeakers(response.data);
    })
    .catch((error) => {
        console.log('error in speakers GET request');
        console.log(error);
    });
  }, []);

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="col-12">
        {/* page header */}
        <div style={{ backgroundColor: '#FFA060' }}>
          <header className="mt-2 p-4 text-white text-center rounded">
            <h1 style={{ fontWeight: 700, color: '#ffffff' }}>Speakers</h1>
          </header>
        </div>

        <div className="d-flex justify-content-center align-items-center">
        {/* statement that checks for speakers. If they're there, display them. If not, show that there are no speakers */}
        {speakers && speakers.length > 0 ? (
          <ul>
            {speakers.map((speaker) => (
              <li className="page_li" key={speaker._id}>
                {/* buttons for editing or deleting a speaker. only appear to logged-in admins */}
                {isAdmin ?
                  <>
                    <button className="btn" style={{backgroundColor:'#FFA060'}} onClick={() => toEditPage(speaker._id)}>Edit</button>
                    <span> </span>
                    <button className="btn" style={{backgroundColor:'#FFA060'}} onClick={() => handleDelete(speaker._id)}>Delete</button>
                  </>
                :
                  <></>
                }

                {/* layout for the speaker itself. */}
                <p>
                  <span style={{ fontWeight: 700 }}>Name:</span> {speaker.name}
                </p>
                <p>
                  <span style={{ fontWeight: 700 }}>Phone:</span> {speaker.phone}
                </p>
                <p>
                  <span style={{ fontWeight: 700 }}>Email:</span> {speaker.email}
                </p>
                <p>
                  <span style={{ fontWeight: 700 }}>Mailing Address:</span> {speaker.mailing_address}
                </p>
                <p>
                  <span style={{ fontWeight: 700 }}>Specialty:</span> {speaker.specialty}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <h1 className='text-center'>No speakers found</h1>
        )}
        </div>
      </div>
    </div>
  );
}

export default Speakers;
