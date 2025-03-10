import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { API_URL, checkServerConnectivity } from '../utils/utils.js';
import GoogleSignInButton from './GoogleSignInButton';
import { initiateGoogleSignIn } from '../utils/googleAuth';
import { useMessage } from '../utils/MessageProvider';
import NavigationOptions from './NavigationOptions';

import '../css/Login.scss';
import LegalFooter from './LegalFooter';

function CreateProfile() {
    const [formState, setFormState] = useState({
        username: { value: '', isValid: false, isUnique: false },
        email: { value: '', isValid: false, isUnique: false },
        password: { value: '', isValid: false }
    });

    const [loadingStates, setLoadingStates] = useState({
        usernameCheck: false,
        emailCheck: false,
        submission: false
    });

    const [isLoading, setIsLoading] = useState(false);

    const [serverStatus, setServerStatus] = useState({
        isConnected: false,
        isDatabaseConnected: false,
        message: ''
    });

    const [token, setToken] = useState('');


    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showError, showSuccess, showWarning, clearMessage } = useMessage();

    const handleGoogleSignIn = () => {
        initiateGoogleSignIn();
    };

    const validateUsername = (username) => {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(username);
    };

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\w\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{8,}$/;
        return regex.test(password);
    };

    const checkUnique = async (field, value) => {
        try {
            const response = await fetch(`${API_URL}/server/api/users/users.php?action=check_unique&field=${field}&value=${value}`);
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

    const debouncedCheckUnique = debounce(async (field, value) => {
        if (!value) return;

        // Only check uniqueness if the field is valid
        const isValid = field === 'username' ? validateUsername(value) : validateEmail(value);
        if (!isValid) return;

        setLoadingStates(prev => ({ ...prev, [field + 'Check']: true }));
        try {
            const isUnique = await checkUnique(field, value);
            setFormState(prev => ({
                ...prev,
                [field]: { ...prev[field], isUnique }
            }));
            // Show warning if the field is not unique
            if (!isUnique) {
                showWarning(`This ${field} is already in use`);
            } else {
                clearMessage();
            }
        } catch (error) {
            console.error(`${field} check failed:`, error);
        } finally {
            setLoadingStates(prev => ({ ...prev, [field + 'Check']: false }));
        }
    }, 500);

    const handleInputChange = (field, value) => {
        let isValid = false;

        // Clear any existing messages when user starts typing
        clearMessage();

        switch (field) {
            case 'username':
                isValid = validateUsername(value);
                if (isValid) {
                    debouncedCheckUnique('username', value);
                }
                break;
            case 'email':
                isValid = validateEmail(value);
                if (isValid) {
                    debouncedCheckUnique('email', value);
                }
                break;
            case 'password':
                isValid = validatePassword(value);
                break;
            default:
                break;
        }

        setFormState(prev => ({
            ...prev,
            [field]: { ...prev[field], value, isValid }
        }));
    };

    const handleBlur = (field) => {
        const fieldState = formState[field];

        // Don't show messages if the field is empty
        if (!fieldState.value) return;

        // Show validation error if the field is invalid
        if (!fieldState.isValid) {
            switch (field) {
                case 'username':
                    showError('"Trail Name" must be 3-20 characters long and can only contain letters, numbers, and underscores');
                    break;
                case 'email':
                    showError('Please enter a valid email address');
                    break;
                case 'password':
                    showError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
                    break;
            }
            return;
        }

        // Show warning if the field is not unique
        if (!fieldState.isUnique && (field === 'username' || field === 'email')) {
            showWarning(`This ${field} is already in use`);
        }
    };

    const isFormValid = () => {
        const { username, email, password } = formState;
        return (
            username.isValid && username.isUnique &&
            email.isValid && email.isUnique &&
            password.isValid
        );
    };

    const getFormError = () => {
        const { username, email, password } = formState;

        if (!username.value || !email.value || !password.value) {
            return 'Please fill in all fields';
        }
        if (!username.isValid) {
            return 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores';
        }
        if (!username.isUnique) {
            return 'This username is already taken';
        }
        if (!email.isValid) {
            return 'Please enter a valid email address';
        }
        if (!email.isUnique) {
            return 'This email is already registered';
        }
        if (!password.isValid) {
            return 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            const error = getFormError();
            if (error) {
                showError(error);
            }
            return;
        }

        try {
            setLoadingStates(prev => ({ ...prev, submission: true }));
            const response = await fetch(`${API_URL}/server/api/users/users.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: 'create',
                    username: formState.username.value,
                    email: formState.email.value,
                    password: formState.password.value
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Server error');
            }
            let data;
            try {
                data = await response.json();
            } catch (parseError) {
                throw new Error('Unable to process server response. Please try again.');
            }
            handleSuccess(data);
        } catch (error) {
            handleError(error.message || 'An unexpected error occurred. Please try again later.');
        } finally {
            setLoadingStates(prev => ({ ...prev, submission: false }));
        }
    };

    const handleSuccess = (data) => {
        const user = data.user;
        if (!user) {
            if (data.error) {
                showError(data.error);
                return;
            }
            console.error("No user data in response");
            showError("Failed to create profile: Missing user data");
            return;
        }

        const userData = {
            id: user.id,
            username: user.username,
            token: user.token || ''
        };

        localStorage.setItem('user', JSON.stringify(userData));
        showSuccess('Profile created successfully!');
        setToken(userData.token);
        login(userData);
        navigate('/');
    };

    const handleError = (error) => {
        const message = error?.message || 'An unexpected error occurred';
        showError(message);
    };

    useEffect(() => {
        checkServerConnectivity().then((status) => {
            setServerStatus(status);
        });
    }, []);

    return (
        <div className="auth-page-wrapper">
            <div className="content-container">
                <div className="login-form">
                    <div className="bodyContent centered">
                        <h1>Create Your Profile</h1>
                        {loadingStates.submission && <div className="loader"></div>}
                        <form onSubmit={handleSubmit} className="create-profile-form">
                            <div className="account-field">
                                <label htmlFor="username">Trail Name:</label>
                                <input
                                    type="text"
                                    id="username"
                                    value={formState.username.value}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    onBlur={() => handleBlur('username')}
                                    required
                                />
                                <div className="field-guide">Username must be 3-20 characters long and can only contain letters, numbers, and underscores</div>
                            </div>

                            <div className="account-field">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formState.email.value}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    required
                                />
                            </div>

                            <div className="account-field">
                                <label htmlFor="password">Password:</label>
                                <input
                                    type="password"
                                    id="password"
                                    value={formState.password.value}
                                    onChange={(e) => handleInputChange('password', e.target.value)}
                                    onBlur={() => handleBlur('password')}
                                    required
                                />
                                <div className="field-guide">Password must be at least 8 characters long and contain uppercase, lowercase, and numbers</div>
                            </div>

                            <div className="button-container">
                                <button
                                    type="submit"
                                    disabled={!isFormValid()}
                                    className={loadingStates.submission ? 'loading' : ''}
                                >
                                    {loadingStates.submission ? 'Creating...' : 'Create Profile'}
                                </button>
                                <GoogleSignInButton
                                    onClick={handleGoogleSignIn}
                                    isLoading={loadingStates.submission}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <LegalFooter />
        </div>
    );
}

export default CreateProfile;