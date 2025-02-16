import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { API_URL } from '../utils/utils.js';
import { useMessage } from '../utils/MessageProvider';
import LegalFooter from './LegalFooter';
import DisplayNameModal from './DisplayNameModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import '../css/Login.scss';

function CreateProfile() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
    const [googleEmail, setGoogleEmail] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Validate inputs
            if (!email || !password || !confirmPassword || !displayName) {
                throw new Error('All fields are required');
            }

            if (password !== confirmPassword) {
                throw new Error('Passwords do not match');
            }

            if (password.length < 8) {
                throw new Error('Password must be at least 8 characters long');
            }

            // Create account
            const response = await fetch(`${API_URL}/create-profile.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    displayName,
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                showSuccess('Account created successfully!');
                login(data.user);
                navigate('/');
            } else {
                throw new Error(data.message || 'Failed to create account');
            }
        } catch (error) {
            showError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
        // Generate and store state parameter for CSRF protection
        const state = Math.random().toString(36).substring(7);
        sessionStorage.setItem('oauth_state', state);
        
        // Get the correct base URL based on environment
        const env = process.env.NODE_ENV;
        const baseUrl = env === 'production' 
            ? 'https://crowtours.com'
            : env === 'staging' 
                ? 'https://ravenruns.com'
                : 'http://localhost:5000';

        // Use consistent callback path for all environments
        const callbackPath = '/server/auth/google-callback.php';

        // Construct Google OAuth URL
        const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        googleAuthUrl.searchParams.append('client_id', process.env.REACT_APP_GOOGLE_CLIENT_ID);
        googleAuthUrl.searchParams.append('redirect_uri', `${baseUrl}${callbackPath}`);
        googleAuthUrl.searchParams.append('response_type', 'code');
        googleAuthUrl.searchParams.append('scope', 'email profile');
        googleAuthUrl.searchParams.append('state', state);

        // Redirect to Google
        window.location.href = googleAuthUrl.toString();
    };

    const handleDisplayNameSubmit = async (newDisplayName) => {
        try {
            const response = await fetch(`${API_URL}/update-display-name.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: googleEmail,
                    displayName: newDisplayName,
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                showSuccess('Display name updated successfully!');
                login(data.user);
                navigate('/');
            } else {
                throw new Error(data.message || 'Failed to update display name');
            }
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="auth-page-wrapper">
            <div className="content-container">
                <h1>Join Crow Tours</h1>
                <div className="login-form">
                    <div className="bodyContent centered">
                        {isLoading && <div className="loader">Loading...</div>}
                        <form className="accountForm" onSubmit={handleSubmit}>
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
                                <label htmlFor="displayName">Display Name:</label>
                                <input
                                    type="text"
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    maxLength={30}
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
                                    minLength={8}
                                />
                            </div>
                            <div className="account-field">
                                <label htmlFor="confirmPassword">Confirm Password:</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="button-container">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="submit-button"
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                                <button
                                    onClick={handleGoogleSignIn}
                                    className="google-sign-in-button"
                                    type="button"
                                    disabled={isLoading}
                                >
                                    <FontAwesomeIcon icon={faGoogle} />
                                    <span>Sign up with Google</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <LegalFooter />
            
            {showDisplayNameModal && (
                <DisplayNameModal
                    email={googleEmail}
                    onSubmit={handleDisplayNameSubmit}
                    onClose={() => setShowDisplayNameModal(false)}
                />
            )}
        </div>
    );
}

export default CreateProfile;