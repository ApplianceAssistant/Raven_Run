import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { checkServerConnectivity, API_URL, hashPassword } from '../utils/utils.js';
import Modal from './Modal';

function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState({ title: '', message: '' });

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
            const response = await authFetch(`${API_URL}/login.php`, {
                method: 'POST',
                body: JSON.stringify({
                    action,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An error occurred');
            }
            if (data.success) {
                setSuccessMessage(data.message);
                setModalContent({
                    title: 'Welcome Back!',
                    message: `Welcome back, ${data.username}! What would you like to do?`,
                    options: [
                        { label: 'Profile', route: '/profile' },
                        { label: 'Find a Game', route: '/lobby' },
                        { label: 'Create', route: '/create' }
                    ]
                });
                setIsModalOpen(true);
                login({ id: data.id, username: data.username, token: data.token });
            } else {
                throw new Error(data.message || 'An error occurred');
            }

        } catch (error) {
            console.error('Error:', error);
            setErrorMessage(error.message || 'An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="content-wrapper">
            <div className="bodyContent center">
                <h1>Welcome Back, Adventurer</h1>
                {isLoading && <div className="loader">Loading...</div>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
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