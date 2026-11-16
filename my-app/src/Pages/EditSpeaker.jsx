import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';

function EditSpeaker() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [notFound, setNotFound] = useState(false);

  // the ID of the speaker comes from the URL
  const { id: speakerID } = useParams();
  const navigate = useNavigate();

  /*
    set default values to what is retrieved from the GET request
  */
  useEffect(() => {
    api
      .get('/speaker/' + speakerID)
      .then((response) => {
        setName(response.data.name || '');
        setPhone(response.data.phone || '');
        setEmail(response.data.email || '');
        setMailingAddress(response.data.mailing_address || '');
        setSpecialty(response.data.specialty || '');
      })
      .catch((error) => {
        console.log('error in speaker GET request');
        console.log(error);
        setNotFound(true);
      });
  }, [speakerID]);

  /*
    submitting the form should call the update function with the appropriate information
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // send the speaker to the backend
    api
      .post('/editspeaker', {
        _id: speakerID,
        name: name,
        phone: phone,
        email: email,
        mailing_address: mailingAddress,
        specialty: specialty,
      })
      .then((response) => {
        // redirect to the page with the list of speakers
        let path = '/Speakers';
        navigate(path);
      })
      .catch((error) => {
        console.log(error);
        window.alert(errorMessage(error, 'Could not update the speaker.'));
      });
  };

  if (notFound) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <h1>Speaker not found</h1>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="col-12 col-lg-6">
        {/*page header*/}
        <div style={{ backgroundColor: '#FFA060' }}>
          <header className="mt-2 p-4 text-white text-center rounded">
            <h1 style={{ fontWeight: 700, color: '#ffffff' }}>Editing Speaker</h1>
          </header>
        </div>

        <form onSubmit={handleSubmit}>
          {/*field for setting the name*/}
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" className="form-control" id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {/*field for setting the phone*/}
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input type="tel" className="form-control" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          {/*field for setting the email*/}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" className="form-control" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {/*field for setting the mailing address*/}
          <div className="form-group">
            <label htmlFor="mailingAddress">Mailing Address</label>
            <input type="text" className="form-control" id="mailingAddress" value={mailingAddress} onChange={(e) => setMailingAddress(e.target.value)} />
          </div>
          {/*field for setting the specialty*/}
          <div className="form-group">
            <label htmlFor="specialty">Specialty</label>
            <input type="text" className="form-control" id="specialty" required value={specialty} onChange={(e) => setSpecialty(e.target.value)} />
          </div>
          {/*submit button*/}
          <button type="submit" className="btn btn-primary">Save</button>
        </form>
      </div>
    </div>
  );
}

export default EditSpeaker;
