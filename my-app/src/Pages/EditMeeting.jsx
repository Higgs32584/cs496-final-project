import React, {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import ImageUpload from '../Components/ImageUpload';
import { combineDateTime, toDateInput, toTimeInput } from '../util';

function EditMeeting()

{
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [speaker, setSpeaker] = useState('');
    const [topic, setTopic] = useState('');
    const [location, setLocation] = useState('');
    const [content, setContent] = useState('');
    // only set if the user picks a new image. otherwise the meeting keeps the image it has.
    const [image, setImage] = useState();
    const [notFound, setNotFound] = useState(false);

    // the ID of the meeting comes from the URL
    const { id: meetingID } = useParams();
    const navigate = useNavigate();

    /*
        set default values to what is retrieved from the GET request
    */
    useEffect(() => {

        api.get("/meeting/" + meetingID)
        .then((response) => {
            // date and time inputs only accept values in a specific format
            setDate(toDateInput(response.data.date));
            setTime(toTimeInput(response.data.date));
            setSpeaker(response.data.speaker || '');
            setTopic(response.data.topic || '');
            setLocation(response.data.location || '');
            setContent(response.data.content || '');
        })
        .catch((error) => {
            console.log('error in meeting GET request');
            console.log(error);
            setNotFound(true);
        });

    }, [meetingID]);

    /*
        submitting the form should call the update function with the appropriate information
    */
    const handleSubmit = async (e) => {
        e.preventDefault();

        let combinedDateTime = combineDateTime(date, time);

        // must be a FormData object for the image to be sent along
        let updatedMeeting = new FormData();
        updatedMeeting.append('_id', meetingID);
        updatedMeeting.append('date', combinedDateTime.toISOString());
        updatedMeeting.append('speaker', speaker);
        updatedMeeting.append('topic', topic);
        updatedMeeting.append('location', location);
        updatedMeeting.append('content', content);
        if(image)
        {
            updatedMeeting.append('meetingImage', image);
        }

        // send the meeting to the backend
        api.post('/updatemeeting', updatedMeeting)
        .then((response) =>
        {
            // redirect to the page for this meeting
            navigate('/ViewMeeting/' + meetingID);
        })
        .catch((error) =>
        {
            console.log(error);
            window.alert(errorMessage(error, 'Could not update the meeting.'));
        });

    };

    if(notFound)
    {
        return (
            <div className="d-flex justify-content-center align-items-center">
                <h1>Meeting not found</h1>
            </div>
        );
    }

    return(
    <div className="d-flex justify-content-center align-items-center">
      <div className="col-12 col-lg-6">
        {/*page header*/}
        <div style={{ backgroundColor: '#B59EC1' }}>
          <header className="mt-2 p-4 text-white text-center rounded">
            <h1 style={{ fontWeight: 700, color: '#ffffff' }}> Editing Meeting </h1>
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
          {/*field for setting the topic*/}
          <div className="form-group">
            <label htmlFor="topic">Topic</label>
            <input type="text" className="form-control" value={topic} id="topic" required onChange={(e) => setTopic(e.target.value)} />
          </div>
          {/*field for setting the location*/}
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input type="text" className="form-control" value={location} id="location" onChange={(e) => setLocation(e.target.value)} />
          </div>
          {/*field for setting the description*/}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea className="form-control" id="description" required value={content} onChange={(e) => setContent(e.target.value)} />
          </div>

          {/*field for replacing the image. leaving it empty keeps the current image.*/}
          <div className="form-group">
            <label>Replace image (optional)</label>
            <ImageUpload imageChange={setImage}/>
          </div>

          <button type="submit" className="btn btn-primary">Submit</button>

        </form>


      </div>
    </div>
    );
}

export default EditMeeting;
