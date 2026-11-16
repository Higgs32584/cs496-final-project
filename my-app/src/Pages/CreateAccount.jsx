import React from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';



function CreateAccount()
{
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [username, setUsername] = React.useState("");

    let navigate = useNavigate();

    function handleSubmit(e)
    {
        e.preventDefault();

        let user =
        {
            email: email,
            password: password,
            username: username

        };

        // perform post action, submitting a new user with the JSON from the form
        api.post("/saveuser", user)
        .then((response) =>
        {
            // the account exists now, so send the user to log in with it
            let path = '/Login';
            navigate(path);
        })
        .catch((error) =>
        {
            console.log(error);
            window.alert(errorMessage(error, 'Could not create the account.'));
        });
    }

    return (
    /* div to display in the center of the page with a compact header and design */
    <div className="col-12 col-lg-6 offset-lg-3 offset-sm-0" style={{display:'inline-block'}}>
        {/* Page header, says 'Create Account'*/}
        <header className="mt-2 p-4 text-white text-center rounded" style={{backgroundColor: '#FFD92B'}}>
          <h1 style={{fontWeight: 700, color:'#ffffff'}}> Create Account </h1>
        </header>

        {/* Form with the email and password */}
        <form className="was-validated" method="post" onSubmit={handleSubmit}>
            {/* Email field */}
            <label className="col-form-label col-12 col-md-3" htmlFor="eml_login"> Email: </label>
            <input
                value={email}
                onChange={ e => setEmail(e.target.value)}
                className="form-control" type="email" name="email" id="eml_login" autoComplete="email" required />

            {/* Username field */}
            <label className="col-form-label col-12 col-md-3" htmlFor="txt_login"> Name: </label>
            <input
                value={username}
                onChange={ e => setUsername(e.target.value)} className="form-control" type="text" name="username" id="txt_login" autoComplete="name" required />

            {/* Password field. the server requires at least 6 characters as well. */}
            <label className="col-form-label col-12 col-md-3" htmlFor="txt_pass"> Password: </label>
              <input
                value={password}
                onChange={ e => setPassword(e.target.value)} className="form-control" name="password" type="password" id="txt_pass" minLength="6" autoComplete="new-password" required />
            <br/>
            <button type="submit" className="btn btn-primary" >Submit</button>
        </form>

    </div>
    );
}

export default CreateAccount;
