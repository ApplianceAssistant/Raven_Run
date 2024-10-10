import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { checkServerConnectivity, API_URL, hashPassword } from '../utils/utils.js';
import Modal from './Modal';

function CreateProfile() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isUsernameUnique, setIsUsernameUnique] = useState(true);
  const [isEmailUnique, setIsEmailUnique] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [token, setToken] = useState('');

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [serverStatus, setServerStatus] = useState({
    isConnected: false,
    isDatabaseConnected: false,
    message: ''
  });

  useEffect(() => {
    checkServerConnectivity().then((status) => {
      setServerStatus(status);
    });
  }, []);

  const checkUnique = async (field, value) => {
    try {
      const response = await fetch(`${API_URL}/users.php?action=check_unique&field=${field}&value=${value}`);
      const data = await response.json();
      return data.isUnique;
    } catch (error) {
      console.error(`Error checking ${field} uniqueness:`, error);
      return false;
    }
  };

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedUsernameCheck = debounce(async (value) => {
    if (value) {
      const isUnique = await checkUnique('username', value);
      setIsUsernameUnique(isUnique);
      if (!isUnique) {
        setErrorMessage(`${value} is already taken, please choose a different username.`);
      } else {
        setErrorMessage('');
      }
    }
  }, 300);

  const debouncedEmailCheck = debounce(async (value) => {
    if (value) {
      const isUnique = await checkUnique('email', value);
      setIsEmailUnique(isUnique);
      if (!isUnique) {
        setErrorMessage('This email is already associated with an profile.');
      } else {
        setErrorMessage('');
      }
    }
  }, 300);

  const validatePassword = (value) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\w\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{8,}$/;
    return regex.test(value);
  };

  useEffect(() => {
    debouncedUsernameCheck(username);
  }, [username]);

  useEffect(() => {
    debouncedEmailCheck(email);
  }, [email]);

  useEffect(() => {
    setIsPasswordValid(validatePassword(password));
  }, [password]);

  const isFormValid = () => {
    return username && email && isPasswordValid && isUsernameUnique && isEmailUnique;
  };

  const handleSubmit = async (action) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!serverStatus.isConnected || !serverStatus.isDatabaseConnected) {
      setErrorMessage('Cannot perform action: Server or database is not connected');
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        action,
        username,
        email,
        password,
      };
      console.log('Sending payload:', payload);

      const response = await fetch(`${API_URL}/users.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Full response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }
      if (data.success) {
        setSuccessMessage(data.message);
        setToken(data.token);
        setModalContent({
          title: 'Welcome!',
          message: `Welcome, ${data.username}! What would you like to do next?`,
          options: [
            { label: 'Settings', route: '/settings' },
            { label: 'Find a Game', route: '/lobby' },
            { label: 'Create', route: '/create' }
          ]
        });
        setShowModal(true);
        login({ id: data.id, username: data.username, token: data.token });
      } else {
        throw new Error(data.message || 'An error occurred');
      }

    } catch (error) {
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="bodyContent center">
        <h1>Welcome, Brave Adventurer</h1>
        {isLoading && <div className="loader">Loading...</div>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}
        <form className="accountForm" onSubmit={(e) => e.preventDefault()}>
          <div className="account-field">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={(e) => debouncedUsernameCheck(e.target.value)}
              required
            />
            {!isUsernameUnique && <p className="error-message">Username is already taken</p>}
          </div>
          <div className="account-field">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => debouncedEmailCheck(e.target.value)}
              required
            />
            {!isEmailUnique && <p className="error-message">Email is already in use</p>}
          </div>
          <div className="account-field">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {!isPasswordValid && password && (
              <p className="error-message">
                Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.
              </p>
            )}
          </div>
          <div className="button-container">
            <button
              onClick={() => handleSubmit('create')}
              disabled={!isFormValid() || isLoading}
              className={`submit-button ${!isFormValid() || isLoading ? 'disabled' : ''}`}
            >
              Create Profile
            </button>
          </div>
        </form>
      </div>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalContent.title}
        content={modalContent.message}
        buttons={modalContent.options ? modalContent.options.map(option => ({
          label: option.label,
          onClick: () => {
            setShowModal(false);
            navigate(option.route);
          },
          className: 'submit-button'
        })) : [
          {
            label: 'OK',
            onClick: () => setShowModal(false),
            className: 'submit-button'
          }
        ]}
      />
    </div>
  );
}

export default CreateProfile;