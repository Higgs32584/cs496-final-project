import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import ImageUpload from '../Components/ImageUpload';
import { combineDateTime } from '../util';

function CreateMeeting() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [speaker, setSpeaker] = useState('');
  const [topic, setTopic] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState();

  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    // stop the page from reloading
    e.preventDefault();

    let combinedDateTime = combineDateTime(date, time);

    // must be a FormData object for the image to be sent along
    let newMeeting = new FormData();
    newMeeting.append('date', combinedDateTime.toISOString());
    newMeeting.append('speaker', speaker);
    newMeeting.append('topic', topic);
    newMeeting.append('location', location);
    newMeeting.append('content', content);
    /* it is SUPER important that the first parameter (in this case, 'meetingImage'),
       is the exact same here as it is on the backend for this request.
       multer is very strict about its field names. */
    if(image)
    {
        newMeeting.append('meetingImage', image);
    }

    // send the meeting to the backend
    api.post('/savemeeting', newMeeting)
    .then((response) =>
    {
        // redirect to the page with upcoming meetings
        let path = '/Home';
        navigate(path);
    })
    .catch((error) =>
    {
        console.log(error);
        window.alert(errorMessage(error, 'Could not save the meeting.'));
    });
  };
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="col-12 col-lg-6">
        {/*page header*/}
        <div style={{ backgroundColor: '#B59EC1' }}>
          <header className="mt-2 p-4 text-white text-center rounded">
            <h1 style={{ fontWeight: 700, color: '#ffffff' }}> Creating Meeting </h1>
          </header>
        </div>

        <form encType="multipart/form-data" onSubmit={handleSubmit}>
          {/*field for setting the date*/}
          <div className="form-group">
            <label htmlFor="meetingDate">Date</label>
            <input type="date" className="form-control" id="meetingDate" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          {/*field for setting the time*/}
          <div className="form-group">
            <label htmlFor="meetingTime">Time</label>
            <input type="time" className="form-control" id="meetingTime" required value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          {/*field for setting the speaker*/}
          <div className="form-group">
            <label htmlFor="speaker">Speaker</label>
            <input type="text" className="form-control" id="speaker" value={speaker} onChange={(e) => setSpeaker(e.target.value)} />
          </div>
          {/*field for setting the topic. the server requires one.*/}
          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input type="text" className="form-control" id="topic" required value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          {/*field for setting the location*/}
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input type="text" className="form-control" id="location" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          {/*field for setting the description. the server requires one.*/}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea className="form-control" id="description" required value={content} onChange={(e) => setContent(e.target.value)} />
          </div>

          {/*field for sending an image*/}
          <div className ="form-group">
          <ImageUpload imageChange={setImage}/>
          </div>

          <button type="submit" className="btn btn-primary">Submit</button>

        </form>
      </div>
    </div>
  );
}

export default CreateMeeting;
