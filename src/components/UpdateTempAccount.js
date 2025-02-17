import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../utils/utils.js';
import { useMessage } from '../utils/MessageProvider';
import '../css/Login.scss';

function UpdateTempAccount({ user, onSuccess, onCancel }) {
    const [formState, setFormState] = useState({
        username: { value: '', isValid: false, isUnique: false },
        password: { value: '', isValid: false }
    });

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { showError, showSuccess } = useMessage();

    const validateUsername = (username) => {
        const regex = /^[a-zA-Z0-9_]{3,20}$/;
        return regex.test(username);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\w\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]{8,}$/;
        return regex.test(password);
    };

    const checkUnique = async (value) => {
        try {
            const response = await fetch(`${API_URL}/server/api/users/users.php?action=check_unique&field=username&value=${value}`);
            const data = await response.json();
            return data.isUnique;
        } catch (error) {
            console.error('Error checking username uniqueness:', error);
            return false;
        }
    };

    const handleInputChange = async (field, value) => {
        let isValid = false;
        let isUnique = false;

        if (field === 'username') {
            isValid = validateUsername(value);
            if (isValid) {
                isUnique = await checkUnique(value);
            }
        } else if (field === 'password') {
            isValid = validatePassword(value);
        }

        setFormState(prev => ({
            ...prev,
            [field]: { 
                ...prev[field], 
                value,
                isValid,
                ...(field === 'username' ? { isUnique } : {})
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formState.username.isValid || !formState.username.isUnique || !formState.password.isValid) {
            showError('Please fill in all fields correctly');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/server/api/users/users.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'update',
                    id: user.id,
                    username: formState.username.value,
                    password: formState.password.value,
                    temporary_account: false
                }),
            });

            const data = await response.json();

            if (data.status === 'success') {
                showSuccess('Account updated successfully!');
                onSuccess(data.user);
            } else {
                throw new Error(data.message || 'Failed to update account');
            }
        } catch (error) {
            showError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Complete Your Profile</h2>
                <p>Please choose a username and password for your account.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="account-field">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={formState.username.value}
                            onChange={(e) => handleInputChange('username', e.target.value)}
                            required
                        />
                        <div className="field-guide">
                            Username must be 3-20 characters long and can only contain letters, numbers, and underscores
                        </div>
                    </div>

                    <div className="account-field">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={formState.password.value}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            required
                        />
                        <div className="field-guide">
                            Password must be at least 8 characters long and contain uppercase, lowercase, and numbers
                        </div>
                    </div>

                    <div className="button-container">
                        <button
                            type="submit"
                            disabled={isLoading || !formState.username.isValid || !formState.username.isUnique || !formState.password.isValid}
                        >
                            {isLoading ? 'Updating...' : 'Update Profile'}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateTempAccount;
