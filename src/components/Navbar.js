import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { logoutUser } from '../redux/actions/authActions.js'; // Ensure you've implemented the logout action

const Navbar = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const auth = useSelector((state) => state.auth);
  const { isAuthenticated, user } = auth;

  const onLogoutClick = (e) => {
    e.preventDefault();
    dispatch(logoutUser());
    history.push('/login');
  };

  // Links displayed when user is authenticated
  const authLinks = (
    <ul>
      <li>
        <Link to="/dashboard">Dashboard</Link>
      </li>
      <li>
        <a href="/" onClick={onLogoutClick}>
          Logout
        </a>
      </li>
    </ul>
  );

  // Links specific to admin role
  const adminLinks = (
    <ul>
      <li>
        <Link to="/add-meal">Add Meal</Link>
      </li>
      // ... more admin specific links
    </ul>
  );

  return (
    <nav>
      <div>
        <Link to="/">
          <strong>Mealy</strong>
        </Link>
        {isAuthenticated && user.role === 'admin' ? adminLinks : (isAuthenticated ? authLinks : null)}
      </div>
    </nav>
  );
};

export default Navbar;
