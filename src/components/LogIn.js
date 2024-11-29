import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { checkServerConnectivity, API_URL, authFetch } from '../utils/utils.js';
import Modal from './Modal';
import { useMessage } from '../utils/MessageProvider';

function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', content: '', buttons: [], type: '', showTextToSpeech: false, speak: '' });

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessage();

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

    const handleSubmit = async (action) => {
        setIsLoading(true);

        // Basic input validation
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
            console.log("Making request to:", `${API_URL}/login.php`);
            const response = await authFetch(`${API_URL}/login.php`, {
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
            console.log("Response status:", response.status);
            console.warn("Response data:", data);

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Too many login attempts. Please try again later.');
                }
                throw new Error(data.message || 'An error occurred');
            }

            if (data.status === 'success') {
                const handleSuccess = (data) => {
                    // Store user data in localStorage
                    const userData = {
                      id: data.user.id,
                      username: data.user.username,
                      token: data.user.token
                    };
                    console.log("userData: ", userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    login(userData); // Pass the complete userData object to login context
                    showSuccess(data.message || 'Login successful!');
                    setTimeout(() => {
                        setIsModalOpen(true);
                        setModalContent({
                            title: `Welcome, ${userData.username}!`,
                            message: ` What would you like to do next?`,
                            options: [
                                { label: 'Settings', route: '/settings' },
                                { label: 'Find a Game', route: '/lobby' },
                                { label: 'Create', route: '/create' }
                            ],
                            type: 'success',
                            showTextToSpeech: true,
                            speak: `Welcome, ${userData.username}! What would you like to do next?`
                        });
                    }, 1000);
                };
                handleSuccess(data);
            }
        } catch (error) {
            showError(error.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="content-wrapper">
            <div className="bodyContent center">
                <h1>Welcome Back, Adventurer</h1>
                {isLoading && <div className="loader">Loading...</div>}
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
                            Log In
                        </button>
                    </div>
                </form>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalContent.title}
                content={modalContent.message}
                buttons={modalContent.options ? modalContent.options.map(option => ({
                    label: option.label,
                    onClick: () => {
                        setIsModalOpen(false);
                        navigate(option.route);
                    },
                    className: 'submit-button'
                })) : [
                    {
                        label: 'OK',
                        onClick: () => setIsModalOpen(false),
                        className: 'submit-button'
                    }
                ]}
            />
        </div>
    );
}

export default LogIn;