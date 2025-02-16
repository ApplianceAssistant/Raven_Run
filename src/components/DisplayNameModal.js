import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { API_URL } from '../utils/utils.js';

function DisplayNameModal({ email, onSubmit, onClose }) {
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateDisplayName = async (name) => {
        if (!name.trim()) {
            throw new Error('Display name is required');
        }

        if (name.length > 30) {
            throw new Error('Display name must be 30 characters or less');
        }

        // Check if username is unique
        const response = await fetch(`${API_URL}/users.php?action=check_unique&field=username&value=${encodeURIComponent(name)}`);
        const data = await response.json();

        if (!data.isUnique) {
            throw new Error('This display name is already taken');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await validateDisplayName(displayName);
            await onSubmit(displayName);
        } catch (error) {
            setError(error.message || 'Failed to set display name');
            setIsLoading(false);
        }
    };

    // Prevent closing if no valid display name
    const handleClose = (e) => {
        if (!displayName.trim()) {
            setError('Please set a display name before continuing');
            return;
        }
        onClose(e);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="modal-header">
                    <h2>Welcome to Crow Tours!</h2>
                </div>
                <div className="modal-body">
                    <p>You've successfully signed in with {email}.</p>
                    <p>Please choose a display name for your profile:</p>
                    
                    <form onSubmit={handleSubmit} className="accountForm">
                        <div className="account-field">
                            <label htmlFor="displayName">Display Name:</label>
                            <input
                                type="text"
                                id="displayName"
                                value={displayName}
                                onChange={(e) => {
                                    setDisplayName(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter your display name"
                                maxLength={30}
                                required
                            />
                            {error && <div className="error-message">{error}</div>}
                        </div>
                        <div className="button-container">
                            <button 
                                type="submit" 
                                className="submit-button"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Saving...' : 'Save Display Name'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default DisplayNameModal;
