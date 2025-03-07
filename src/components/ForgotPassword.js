import React, { useState, useEffect } from 'react';
import { API_URL, authFetch } from '../utils/utils.js';
import { useMessage } from '../utils/MessageProvider';
import '../css/ForgotPassword.scss';

function ForgotPassword({ onClose }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const { showError, showSuccess } = useMessage();

    useEffect(() => {
        // Start the entrance animation after a brief delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 50);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for the exit animation to complete before calling onClose
        setTimeout(onClose, 300);
    };

    const handleModalClick = (e) => {
        // Only close if clicking the overlay itself, not its children
        if (e.target.className.includes('modal-overlay')) {
            handleClose();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authFetch(`${API_URL}/server/auth/password-reset.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            showSuccess('Password reset instructions have been sent to your email');
            handleClose();
        } catch (error) {
            showError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className={`modal-overlay ${isVisible ? 'visible' : ''}`}
            onClick={handleModalClick}
        >
            <div className={`modal-content ${isVisible ? 'visible' : ''}`}>
                <h2>Reset Password</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={`button-group ${isVisible ? 'visible' : ''}`}>
                        <button 
                            type="button" 
                            className="cancel" 
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;