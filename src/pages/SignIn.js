import React, { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sign = ({ user }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hidePass, setHidePass] = useState(true);
  const [signUp, setSignUp] = useState(true);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect to home if user exists
    }
  }, [user, navigate]);

  function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  const submitSign = async () => {
    if (signUp) {
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    if (!isValidEmail(email)) {
      alert('Invalid email format');
      return;
    }

    const url = `https://quizure.com/api/${signUp ? 'sign_up' : 'log_in'}`;
    const data = { email, password };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // necessary for passport.js to set session cookies
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (signUp) {
      if (result.duplicate) {
        alert("Account already exists and is verified. Please log in.");
        setSignUp(false);
        setPassword('');
      } else if (result === true) {
        setEmailSent(true);
      } else {
        alert("Unexpected response.");
      }
    } else {
      if (response.ok && result && result.id) {
        alert("Successfully logged in");
        navigate('/');
      } else {
        alert("Invalid credentials or account is not confirmed.");
      }
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  return emailSent ?
    <div style={{ maxWidth: 400, margin: '65px auto', padding: 20 }}>
      <p style={{ textAlign: 'center' }}>
        We've sent a verification email to <span style={{ color: "blue" }}>{email}</span>.
        <br />Please check your inbox to continue.
      </p>
      <p style={{ textAlign: 'center', fontStyle: 'italic', color: '#555' }}>
        * Also check your spam or junk folder if you don't see it.
      </p>
    </div>
    :
    <div style={{ maxWidth: 400, margin: '65px auto', padding: 20 }}>

      <div style={{ marginBottom: 10 }}>
        <input
          type='text'
          placeholder='Email'
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
        <input
          type={hidePass ? 'password' : 'text'}
          placeholder={signUp ? 'Create Password' : 'Password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />
        {signUp && (
          <input
            type={hidePass ? 'password' : 'text'}
            placeholder='Confirm Password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={inputStyle}
          />
        )}
      </div>


      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 10, cursor: 'pointer' }}
        onClick={() => setHidePass(!hidePass)}
      >
        {hidePass ? <FaEyeSlash size={18} color="grey" /> : <FaEye size={18} color="grey" />}
        <span style={{ marginLeft: 6, color: 'grey' }}>
          {hidePass ? ' Show password' : ' Hide password'}
        </span>
      </div>

      <button
        style={{ width: '100%', padding: '10px', marginBottom: 10 }}
        onClick={submitSign}
      >
        {signUp ? 'Sign up' : 'Log in'}
      </button>

      <button
        style={{ width: '100%', padding: '10px', marginBottom: 10 }}
        onClick={() => setSignUp(!signUp)}
      >
        {signUp ? 'Go to Log in' : 'Go to Sign up'}
      </button>

      <button
        style={{ width: '100%', padding: '10px', backgroundColor: '#c4523d', color: 'white' }}
        onClick={() => window.open(`https://quizure.com/api/auth/google`, '_blank')}
      >
        Google
      </button>
    </div>
    ;
};

export default Sign;
