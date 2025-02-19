import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_URL, authFetch } from '../utils/utils.js';
import { useMessage } from '../utils/MessageProvider';
import '../css/ResetPassword.scss';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessage();
    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            navigate('/log-in');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            showError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            console.log('Attempting to reset password with token:', token);
            const response = await authFetch(`${API_URL}/server/auth/password-update.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            console.log('Password reset response status:', response.status);
            const data = await response.json();
            console.log('Password reset response:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            showSuccess('Password has been reset successfully');
            navigate('/log-in');
        } catch (error) {
            console.error('Password reset error:', error);
            showError(error.message || 'An error occurred while resetting your password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-form">
                <div className="reset-password-card">
                    <h2>Reset Password</h2>
                    <p>Even great explorers get lost from time to time. Don't worry, we'll get you back on track!</p>
                    
                    <form className='form-body' onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="8"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;