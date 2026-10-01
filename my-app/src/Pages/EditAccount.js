import React, {useState,useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useUser } from '../UserContext';

function EditAccount() {
  // Define state variables for username, email, and password
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // The logged-in user, shared by the whole site
  const { user, loading, setUser } = useUser();
  const navigate = useNavigate();

  // Fill in the form with the user's current information once it is known
  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Define a function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Send the user information to the backend to update their account.
    // The server only updates the account that is logged in, and an empty password is left unchanged.
    api.post('/updateuser', {
        username: username,
        email: email,
        password: password,
      })
      .then((response) => {
        // Share the updated information with the rest of the site
        setUser(response.data);
        setPassword('');
        window.alert('Your account has been updated.');
        navigate('/Home');
      })
      .catch((error) => {
        console.log(error);
        window.alert(errorMessage(error, 'Could not update the account.'));
      });
  };

  // Define a function to delete the account
  const handleDelete = () => {
    let confirmDelete = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (confirmDelete) {
      api.delete(`/user/${user._id}`)
        .then(() => {
          // Deleting the account also logs the user out
          setUser(null);
          navigate('/Home');
        })
        .catch((error) => {
          console.log(error);
          window.alert(errorMessage(error, 'Could not delete the account.'));
        });
    }
  };

  // Wait until we know who is logged in
  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <div className='text-center mt-4'>
        <h1>Not logged in</h1>
        <p>You must be logged in to edit your account.</p>
        <NavLink to="/Login" className="btn btn-primary">Login</NavLink>
      </div>
    );
  }

  // Render the form for editing account information
  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="col-12 col-lg-6">
        {/* Page header */}
        <div style={{ backgroundColor: '#B59EC1' }}>
          <header className="mt-2 p-4 text-white text-center rounded">
            <h1 style={{ fontWeight: 700, color: '#ffffff' }}> Edit Account </h1>
          </header>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Field for setting the username */}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              className="form-control"
              id="username"
              autoComplete="name"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Field for setting the email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Field for setting the password */}
          <div className="form-group">
            <label htmlFor="password">New Password (leave empty to keep your current one)</label>
            <input
              type="password"
              className="form-control"
              id="password"
              autoComplete="new-password"
              minLength="6"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <br/>
          {/* Submit button */}
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
          <span> </span>
          <button type="button" className="btn" style={{ backgroundColor: '#B71429' }} onClick={handleDelete}>
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditAccount;
