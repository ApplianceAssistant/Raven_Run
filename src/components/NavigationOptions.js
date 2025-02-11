// NavigationOptions.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ScrollableContent from './ScrollableContent';
import { faUser, faGamepad, faPlus, faSearch, faTrophy, faUsers, faDiceD20, faBook, faGear } from '@fortawesome/free-solid-svg-icons';
import '../css/NavigationOptions.scss';

const defaultOptions = [
    {
        id: 'findGame',
        label: 'Find a Game',
        route: '/lobby',
        icon: faSearch,
        description: 'Join an existing game'
    },
    {
        id: 'create',
        label: 'Create',
        route: '/create',
        icon: faDiceD20,
        description: 'Create a new game'
    },
    {
        id: 'profile',
        label: 'Profile',
        route: '/profile',
        icon: faUser,
        description: 'View and edit your profile'
    },
    {
        id: 'friends',
        label: 'Friends',
        route: '/friends',
        icon: faUsers,
        description: 'Connect with other players'
    },
    {
        id: 'settings',
        label: 'Settings',
        route: '/settings',
        icon: faGear,
        description: 'Adjust game settings'
    },
    {
        id: 'documentation',
        label: 'Documentation',
        route: '/documentation',
        icon: faBook,
        description: 'View user guides and help'
    }
];

const NavigationOptions = ({
    title,
    subtitle,
    options = defaultOptions,
    className = '',
    onOptionClick
}) => {
    const navigate = useNavigate();

    const handleOptionClick = (option) => {
        if (onOptionClick) {
            onOptionClick(option);
        } else {
            navigate(option.route);
        }
    };

    return (
        <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 85)">
            <div className={`navigation-wrapper ${className}`}>
                {title && <h1 className="navigation-title">{title}</h1>}
                {subtitle && <p className="navigation-subtitle">{subtitle}</p>}
                <div className="navigation-options">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            className="navigation-card"
                            onClick={() => handleOptionClick(option)}
                        >
                            <FontAwesomeIcon icon={option.icon} className="nav-icon" />
                            <h3>{option.label}</h3>
                            <p>{option.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </ScrollableContent>
    );
};

export default NavigationOptions;