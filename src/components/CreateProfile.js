import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { checkServerConnectivity, API_URL } from '../utils/utils.js';
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
  const [modalContent, setModalContent] = useState({ title: '', content: '', buttons: [], type: '', showTextToSpeech: false, speak: '' });
  const [token, setToken] = useState('');

  // Add a custom hook for form state management
  const useFormState = (initialState) => {
    const [formState, setFormState] = useState(initialState);
    const [errors, setErrors] = useState({});

    const updateField = (field, value) => {
      setFormState(prev => ({ ...prev, [field]: value }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    };

    return [formState, updateField, errors, setErrors];
  };

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Add loading states for individual operations
  const [loadingStates, setLoadingStates] = useState({
    usernameCheck: false,
    emailCheck: false,
    submission: false
  });

  const setLoading = (operation, isLoading) => {
    setLoadingStates(prev => ({ ...prev, [operation]: isLoading }));
  };

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
    console.warn("field: ", field, " value: ", value);
    try {
      const response = await fetch(`${API_URL}/users.php?action=check_unique&field=${field}&value=${value}`);
      const data = await response.json();
      console.log("data: ", data);
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

  // Add rate limiting to API checks
  const rateLimitedCheck = (checkFn) => {
    let lastCall = 0;
    const minInterval = 500; // ms

    return async (...args) => {
      const now = Date.now();
      if (now - lastCall < minInterval) {
        return;
      }
      lastCall = now;
      return checkFn(...args);
    };
  };

  const debouncedUsernameCheck = rateLimitedCheck(async (value) => {
    if (!validateUsername(value)) {
      setIsUsernameUnique(false);
      setErrorMessage('Invalid username format');
      return;
    }
    setLoading('usernameCheck', true);
    try {
      const isUnique = await checkUnique('username', value);
      setIsUsernameUnique(isUnique);
      if (!isUnique) {
        setErrorMessage(`${value} is already taken, please choose a different username.`);
      } else {
        setErrorMessage('');
      }
    } finally {
      setLoading('usernameCheck', false);
    }
  }, 300);

  const debouncedEmailCheck = debounce(async (value) => {
    if (value) {
      setLoading('emailCheck', true);
      try {
        const isUnique = await checkUnique('email', value);
        setIsEmailUnique(isUnique);
        if (!isUnique) {
          setErrorMessage('This email is already associated with an existing profile.');
        } else {
          setErrorMessage('');
        }
      } finally {
        setLoading('emailCheck', false);
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

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
  };

  // Update form validation
  const isFormValid = () => {
    return (
      username &&
      validateUsername(username) &&
      email &&
      validateEmail(email) &&
      isPasswordValid &&
      isUsernameUnique &&
      isEmailUnique
    );
  };

  const handleSuccess = (data) => {
    // Store user data in localStorage
    const userData = {
      id: data.id,
      username: data.username,
      token: data.token
    };
    localStorage.setItem('user', JSON.stringify(userData));
    
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
    login(userData); // Pass the complete userData object to login context
  };

  const handleError = (error) => {
    setErrorMessage(error.message || 'An error occurred. Please try again.');
    setSuccessMessage('');
  };

  const handleSubmit = async (action) => {
    try {
      setLoading('submission', true);
      setErrorMessage('');

      // Validate inputs before submission
      if (!isFormValid()) {
        throw new Error('Please fill all fields correctly');
      }

      const response = await fetch(`${API_URL}/users.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF protection
        },
        credentials: 'include', // For cookies if needed
        body: JSON.stringify({
          action,
          username: username.trim(),
          email: email.toLowerCase().trim(),
          password: password, // Send plain password over HTTPS
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Server error');
      }

      const data = await response.json();
      handleSuccess(data);
    } catch (error) {
      handleError(error);
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
            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={(e) => debouncedUsernameCheck(e.target.value)}
                required
              />
              {loadingStates.usernameCheck && <span className="loading-spinner">⌛</span>}
            </div>
            {!isUsernameUnique && <p className="error-message">Username is already taken</p>}
          </div>
          <div className="account-field">
            <label htmlFor="email">Email:</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => debouncedEmailCheck(e.target.value)}
                required
              />
              {loadingStates.emailCheck && <span className="loading-spinner">⌛</span>}
            </div>
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
              type="submit"
              onClick={() => handleSubmit('create')}
              disabled={!isFormValid() || loadingStates.submission}
              className={loadingStates.submission ? 'loading' : ''}
            >
              {loadingStates.submission ? 'Creating...' : 'Create Profile'}
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