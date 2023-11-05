import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import './Register.css';
import { registerUser } from '../redux/actions/authActions.js';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const dispatch = useDispatch();
  const history = useHistory();

  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, error } = auth;

  useEffect(() => {
    let timeoutId;

    if (isAuthenticated) {
      setSuccessMessage("Successfully Registered!");
      timeoutId = setTimeout(() => {
        setSuccessMessage('');
        role === "user" ? history.push('/login_user') : history.push('/login_admin');
      }, 2000);
    }

    if (error && error.error === "username_taken") {
      setErrors(prevErrors => ({ ...prevErrors, username: error.message }));
    } else if (error) {
      setErrors(error);
    }

    return () => {
      clearTimeout(timeoutId);
    };

  }, [isAuthenticated, error, role, history, errors]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrors(prevErrors => ({ ...prevErrors, confirmPassword: "Passwords don't match" }));
      return;
    }

    const newUser = { username, email, password, role };
    // Integrated the dispatch call with history and setSuccessMessage as per the provided snippet
    dispatch(registerUser(newUser, history, setSuccessMessage));
};

const handleLoginRedirect = (role) => {
  role === 'user' ? history.push('/login_user') : history.push('/login_admin');
};


  return (
    <div className="register-container">
      <h1 className="register-title">Register</h1>
      {successMessage && <div className="success-message">{successMessage}</div>}
      <form className="register-form" onSubmit={handleSubmit}>
        {/* ... existing form fields */}
        <div>
          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            className="register-form-input"
          />
          <span className="register-form-error">{errors.username}</span>
        </div>
        <div>
          <input
            type="email"
            placeholder="Email Address"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            error={errors.email}
            className="register-form-input"
          />
          <span className="register-form-error">{errors.email}</span>
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            error={errors.password}
            className="register-form-input"
          />
          <span className="register-form-error">{errors.password}</span>
        </div>
        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            error={errors.confirmPassword}
            className="register-form-input"
          />
          <span className="register-form-error">{errors.confirmPassword}</span>
        </div>
        <div>
          <label className="register-form-label">
            Role:
            <select value={role} onChange={(e) => setRole(e.target.value)} className="register-form-input">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <div>
          <button type="submit" className="register-form-button">Register</button>
        </div>
      </form>
      <div className="login-buttons">
        <button onClick={() => handleLoginRedirect('user')} className="login-button">Login as User</button>
        <button onClick={() => handleLoginRedirect('admin')} className="login-button">Login as Admin</button>
      </div>
    </div>
  );
};

export default Register;
