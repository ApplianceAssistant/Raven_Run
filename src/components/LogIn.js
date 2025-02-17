import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { checkServerConnectivity, API_URL, authFetch } from '../utils/utils.js';
import GoogleSignInButton from './GoogleSignInButton';
import { initiateGoogleSignIn } from '../utils/googleAuth';
import { useMessage } from '../utils/MessageProvider';
import LegalFooter from './LegalFooter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import UpdateTempAccount from './UpdateTempAccount';
import '../css/Login.scss';

function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedInSuccessfully, setIsLoggedInSuccessfully] = useState(false);

    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessage();

    const [serverStatus, setServerStatus] = useState({
        isConnected: false,
        isDatabaseConnected: false,
        message: ''
    });

    const [showUpdateTemp, setShowUpdateTemp] = useState(false);
    const [tempUser, setTempUser] = useState(null);

    // Check if user is already logged in and redirect if they are
    useEffect(() => {
        // Get URL parameters first
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        
        // Only redirect if there's no token and user is logged in
        if (user && !token) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        // Get URL parameters
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            showError(decodeURIComponent(error));
            return;
        }

        if (token) {
            // Verify and decode the JWT token
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const userData = {
                    id: tokenData.data.user_id,
                    email: tokenData.data.email,
                    username: tokenData.data.username,
                    token: token,
                    temporary_account: tokenData.data.temporary_account || false
                };
                console.warn('userData', userData);
                if (userData.temporary_account) {
                    // Show update modal for temporary accounts
                    setTempUser(userData);
                    setShowUpdateTemp(true);
                } else if (userData.username) {
                    // Existing user - log them in
                    localStorage.setItem('user', JSON.stringify(userData));
                    login(userData);
                    navigate('/');
                } else {
                    // New user - redirect to create profile
                    navigate('/create-profile', {
                        state: {
                            email: userData.email,
                            token: token
                        }
                    });
                }
            } catch (error) {
                console.error('Token parsing error:', error);
                showError('Invalid authentication token');
            }
        }
    }, [navigate, login, showError]);

    useEffect(() => {
        checkServerConnectivity().then((status) => {
            setServerStatus(status);
        });
    }, []);

    const handleGoogleSignIn = () => {
        initiateGoogleSignIn();
    };

    const handleSubmit = async (action) => {
        setIsLoading(true);

        if (!email || !email.includes('@')) {
            showError('Please enter a valid email address');
            setIsLoading(false);
            return;
        }

        if (!password || password.length < 8) {
            showError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        if (!serverStatus.isConnected || !serverStatus.isDatabaseConnected) {
            showError('Cannot perform action: Server or database is not connected');
            setIsLoading(false);
            return;
        }

        try {
            const response = await authFetch(`${API_URL}/server/auth/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    email,
                    password,
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Too many login attempts. Please try again later.');
                }
                const errorMessage = data.debug_info
                    ? `${data.message} (Debug: ${data.debug_info})`
                    : data.message || 'An error occurred';
                throw new Error(errorMessage);
            }

            handleSuccess(data);
        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuccess = (data) => {
        if (data.temporary_account) {
            setTempUser(data);
            setShowUpdateTemp(true);
        } else {
            localStorage.setItem('user', JSON.stringify(data));
            login(data);
            navigate('/');
        }
    };

    const handleTempAccountUpdate = (updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(updatedUser);
        setShowUpdateTemp(false);
        navigate('/');
    };

    return (
        <div className="auth-page-wrapper">
            <div className="content-container">
                <h1>Welcome to Crow Tours</h1>
                <div className="login-form">
                    <div className="bodyContent centered">
                        <h1>Welcome Back, Adventurer</h1>
                        {isLoading && <div className="loader"></div>}
                        <form className="accountForm" onSubmit={(e) => e.preventDefault()}>
                            <div className="account-field">
                                <label htmlFor="email">Email:</label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
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
                            </div>
                            <div className="button-container">
                                <button
                                    onClick={() => handleSubmit('login')}
                                    disabled={!email || !password || isLoading}
                                    className={`submit-button ${!email || !password || isLoading ? 'disabled' : ''}`}
                                >
                                    {isLoading ? 'Logging in...' : 'Log In'}
                                </button>
                                <GoogleSignInButton
                                    onClick={handleGoogleSignIn}
                                    isLoading={isLoading}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {showUpdateTemp && (
                <UpdateTempAccount
                    user={tempUser}
                    onSuccess={handleTempAccountUpdate}
                    onCancel={() => setShowUpdateTemp(false)}
                />
            )}
            <LegalFooter />
        </div>
    );
}

export default LogIn;