import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import '../css/Login.scss';

function GoogleSignInButton({ onClick, isLoading }) {
    return (
        <button 
            className="google-sign-in-button" 
            onClick={onClick}
            disabled={isLoading}
        >
            <FontAwesomeIcon icon={faGoogle} />
            <span>Continue with Google</span>
        </button>
    );
}

export default GoogleSignInButton;