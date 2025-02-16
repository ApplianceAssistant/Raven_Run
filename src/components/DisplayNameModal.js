import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function DisplayNameModal({ email, onSubmit, onClose }) {
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) {
            setError('Display name is required');
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(displayName);
        } catch (error) {
            setError(error.message || 'Failed to set display name');
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
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
