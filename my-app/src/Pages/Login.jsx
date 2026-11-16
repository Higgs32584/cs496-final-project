import React from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../api';
import { useUser } from '../UserContext';



function Login()
{
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const { setUser } = useUser();
    let navigate = useNavigate();

    function handleSubmit(e)
    {
        // stop the page from reloading
        e.preventDefault();

        let user =
        {
            email: email,
            password: password

        };

        // perform post action, submitting the email and password for verification
        api.post("/dologin", user)
        .then((response) =>
        {
            // the server answers with the logged-in user. sharing it through the
            // UserContext updates the navbar and every page, with no reload needed.
            setUser(response.data);

            let path = '/Home';
            navigate(path);
        })
        .catch((error) =>
        {
            console.log("error trying to log in");
            console.log(error);
            if(error.response && error.response.status === 401)
            {
                window.alert('Incorrect Login Credentials.');
            }
            else
            {
                window.alert(errorMessage(error, 'Could not log in.'));
            }
        });
    }

    return (
    /* div to display in the center of the page with a compact header and design */
    <div className="col-12 col-lg-6 offset-lg-3 offset-sm-0" style={{display:'inline-block'}}>
        {/* Page header, says 'Account Login'*/}
        <header className="mt-2 p-4 text-white text-center rounded" style={{backgroundColor: '#FFD92B'}}>
          <h1 style={{fontWeight: 700, color:'#ffffff'}}> Account Login </h1>
        </header>

        {/* Form with the email and password */}
        <form className="was-validated" method="post" onSubmit={handleSubmit}>
            {/* Email field */}
            <label className="col-form-label col-12 col-md-3" htmlFor="eml_login"> Email: </label>
            <input
                value={email}
                onChange={ e => setEmail(e.target.value)}
                className="form-control" type="email" name="email" id="eml_login" autoComplete="email" required />

            {/* Password field */}
            <label className="col-form-label col-12 col-md-3" htmlFor="txt_pass"> Password: </label>
              <input
                value={password}
                type="password"
                onChange={ e => setPassword(e.target.value)} className="form-control" name="password" id="txt_pass" autoComplete="current-password" required />
            <br/>
            <button type="submit" className="btn btn-primary" >Submit</button>
        </form>

    </div>
    );
}

export default Login;
