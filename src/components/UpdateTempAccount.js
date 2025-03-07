import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, authFetch } from '../utils/utils.js';
import { useMessage } from '../utils/MessageProvider';
import debounce from 'lodash.debounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrow } from '@fortawesome/free-solid-svg-icons';
import '../css/Login.scss';

function UpdateTempAccount({ user, onSuccess, onCancel }) {
    const [formState, setFormState] = useState({
        username: { value: '', isValid: false, isUnique: false }
    });

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessage();

    const validateUsername = (username) => {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(username);
    };

    // Create debounced check function
    const debouncedCheckUnique = useCallback(
        debounce(async (value) => {
            if (!validateUsername(value)) return;
            try {
                const response = await authFetch(
                    `${API_URL}/server/api/users/users.php?action=check_unique&field=username&value=${value}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${user.token}`
                        }
                    }
                );
                const data = await response.json();
                setFormState(prev => ({
                    username: { ...prev.username, isUnique: data.isUnique }
                }));
            } catch (error) {
                console.error('Error checking trail name uniqueness:', error);
            }
        }, 500),
        [user.token]
    );

    const handleInputChange = (value) => {
        const isValid = validateUsername(value);
        setFormState(prev => ({
            username: { ...prev.username, value, isValid }
        }));

        if (isValid) {
            debouncedCheckUnique(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formState.username.isValid || !formState.username.isUnique) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await authFetch(`${API_URL}/server/api/users/users.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    action: 'update_temp_account',
                    user_id: user.id,
                    username: formState.username.value
                })
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Failed to update profile');
            }

            showSuccess('Welcome to the trails! Your adventure begins now! 🦅');
            
            // Keep the existing token when updating user data
            const updatedUser = {
                ...user,
                ...data.user,
                token: user.token // Keep the existing token
            };
            
            onSuccess(updatedUser);
        } catch (error) {
            console.error('Update error:', error);
            showError(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = () => {
        return formState.username.isValid && formState.username.isUnique;
    };

    return (
        <div className="modal-overlay visible">
            <div className="modal-content visible">
                <h2>
                    Welcome to the Flock! <FontAwesomeIcon icon={faCrow} className="crow-icon" />
                </h2>
                <p className="welcome-text">Every great adventurer needs a trail name. What shall we call you?</p>
                <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="form-group">
                        <label htmlFor="trail-name">Trail Name:</label>
                        <input
                            type="text"
                            id="trail-name"
                            name="trail-name-new" // Unique name to prevent autofill
                            value={formState.username.value}
                            onChange={(e) => handleInputChange(e.target.value)}
                            placeholder="Create your trail name"
                            required
                            autoComplete="off"
                            autoFocus
                        />
                        <div className="field-guide">
                            Your trail name must be 3-20 characters long and can only contain letters, numbers, and underscores
                        </div>
                        {formState.username.value && !formState.username.isValid && (
                            <div className="error">Please follow the trail name guidelines above</div>
                        )}
                        {formState.username.isValid && !formState.username.isUnique && (
                            <div className="error">This trail name is already claimed by another adventurer</div>
                        )}
                    </div>
                    <div className="button-group visible">
                        <button type="button" className="secondary" onClick={onCancel}>
                            Maybe Later
                        </button>
                        <button
                            type="submit"
                            className="primary"
                            disabled={!isFormValid() || isLoading}
                        >
                            {isLoading ? 'Preparing Your Pack...' : 'Hit The Trail'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateTempAccount;
