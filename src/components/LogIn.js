import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { checkServerConnectivity, API_URL, authFetch } from '../utils/utils.js';
import { useMessage } from '../utils/MessageProvider';
import NavigationOptions from './NavigationOptions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGamepad, faPlus } from '@fortawesome/free-solid-svg-icons';
import '../css/Login.scss';

function LogIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedInSuccessfully, setIsLoggedInSuccessfully] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessage();

    const [serverStatus, setServerStatus] = useState({
        isConnected: false,
        isDatabaseConnected: false,
        message: ''
    });

    const navigationOptions = [
        { label: 'Profile', route: '/profile', icon: faUser, description: 'View and edit your profile' },
        { label: 'Find a Game', route: '/lobby', icon: faGamepad, description: 'Join an existing game' },
        { label: 'Create', route: '/create', icon: faPlus, description: 'Create a new game' }
    ];

    useEffect(() => {
        checkServerConnectivity().then((status) => {
            setServerStatus(status);
        });
    }, []);

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
            const response = await authFetch(`${API_URL}/api/login.php`, {
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
                throw new Error(data.message || 'An error occurred');
            }

            if (data.status === 'success') {
                const userData = {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    token: data.token
                };
                localStorage.setItem('user', JSON.stringify(userData));
                login(userData);
                setIsLoggedInSuccessfully(true);
            }
        } catch (error) {
            showError(error.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoggedInSuccessfully) {
        return (
            <NavigationOptions 
                title={`Welcome, ${JSON.parse(localStorage.getItem('user')).username}!`}
                subtitle="What would you like to do next?"
            />
        );
    }

    return (
        <>
            <div className="bodyContent">
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
        </>
    );
}

export default LogIn;