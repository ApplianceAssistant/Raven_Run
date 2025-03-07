import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL, authFetch } from '../utils/utils.js';
import { useMessage } from '../utils/MessageProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../css/ResetPassword.scss';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessage();
    const token = searchParams.get('token');

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\w\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{8,}$/;
        return regex.test(password);
    };

    useEffect(() => {
        if (!token) {
            navigate('/log-in');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validatePassword(password)) {
            showError('Password must be at least 8 characters long and contain uppercase, lowercase, and numbers');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const response = await authFetch(`${API_URL}/server/auth/password-update.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            showSuccess('Password has been reset successfully');
            navigate('/log-in');
        } catch (error) {
            showError('Unable to reset password. Please try again or contact support.');
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-form">
                <div className="reset-password-card">
                    <h2>Reset Password</h2>
                    <p>Even great explorers get lost from time to time. Don't worry, we'll get you back on track!</p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength="8"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                                >
                                    <FontAwesomeIcon icon={showPasswords ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="password-input-container">
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <p className="password-requirements">
                            Password must be at least 8 characters long and contain uppercase, lowercase, and numbers
                        </p>
                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;