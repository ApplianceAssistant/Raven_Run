import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { API_URL, authFetch } from '../utils/utils';
import ScrollableContent from './ScrollableContent';
import '../css/Friends.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faPlusCircle, faBan } from '@fortawesome/free-solid-svg-icons';
import { useMessage } from '../utils/MessageProvider';

function Friends() {
    const { user } = useContext(AuthContext);
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const { showError, showSuccess } = useMessage();

    useEffect(() => {
        if (user) {
            fetchFriends();
            fetchFriendRequests();
        }
    }, [user]);

    const fetchFriends = async () => {
        try {
            const response = await authFetch(`${API_URL}/api/friends.php?action=get_friends&user_id=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch friends');
            const data = await response.json();
            setFriends(data.friends);
        } catch (error) {
            showError('Failed to load friends');
        }
    };

    const fetchFriendRequests = async () => {
        try {
            const response = await authFetch(`${API_URL}/api/friends.php?action=get_friend_requests&user_id=${user.id}`);
            if (!response.ok) {
                error_logger('Failed to fetch friend requests');
                throw new Error('Failed to fetch friend requests');
            }
            const data = await response.json();
            setFriendRequests(data.friend_requests);
        } catch (error) {
            showError('Failed to load friend requests');
        }
    };

    const handleSearch = async (searchValue) => {
        if (!searchValue.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await authFetch(`${API_URL}/api/friends.php?action=search_users&query=${searchValue}`);
            if (!response.ok) {
                throw new Error('Failed to search users');
            }
            const data = await response.json();
            setSearchResults(data.users);
        } catch (error) {
            showError('Failed to search users');
        }
    };

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Clear any existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set a new timeout to search after 500ms of no typing
        const timeoutId = setTimeout(() => {
            handleSearch(value);
        }, 500);

        setSearchTimeout(timeoutId);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            handleSearch(searchQuery);
        }
    };

    const sendFriendRequest = async (friendId) => {
        try {
            const response = await authFetch(`${API_URL}/api/friends.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'send_friend_request',
                    sender_id: user.id,
                    receiver_id: friendId
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to send friend request');
            }
            if (data.message === 'Friend request already sent') {
                showSuccess('Friend request already sent');
                return;
            }

            showSuccess('Friend request sent successfully');
        } catch (error) {
            showError('Failed to send friend request');
        }
    };

    const acceptFriendRequest = async (requestId) => {
        try {
            const response = await authFetch(`${API_URL}/api/friends.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'accept_friend_request',
                    request_id: requestId
                })
            });
            if (!response.ok) {
                error_logger('Failed to accept friend request');
                throw new Error('Failed to accept friend request');
            }
            fetchFriends();
            fetchFriendRequests();
            showSuccess('Friend request accepted');
        } catch (error) {
            showError('Failed to accept friend request');
        }
    };

    const ignoreFriendRequest = async (requestId) => {
        try {
            const response = await authFetch(`${API_URL}/api/friends.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'ignore_friend_request',
                    request_id: requestId
                })
            });
            if (!response.ok) {
                error_logger('Failed to ignore friend request');
                throw new Error('Failed to ignore friend request');
            }
            fetchFriendRequests();
            showSuccess('Friend request ignored');
        } catch (error) {
            showError('Failed to ignore friend request');
        }
    };

    const removeFriend = async (friendId) => {
        try {
            const response = await authFetch(`${API_URL}/api/friends.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'remove_friend',
                    user_id: user.id,
                    friend_id: friendId
                })
            });
            if (!response.ok) {
                error_logger('Failed to remove friend');
                throw new Error('Failed to remove friend');
            }
            fetchFriends();
            showSuccess('Friend removed successfully');
        } catch (error) {
            showError('Failed to remove friend');
        }
    };

    return (
        <div className="content">
            <div className="friends-search">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    onKeyPress={handleKeyPress}
                    placeholder="Search users"
                    className="search-input"
                />
            </div>
            <ScrollableContent maxHeight="60vh">
                <div className="search-results">
                    {searchQuery && (
                        <>
                            {searchResults.length > 0 ? (
                                <>
                                    <div className="list-header">
                                        <h3>Player</h3>
                                        <h3>Add Friend</h3>
                                    </div>
                                    {searchResults.map(user => (
                                        <div key={user.id} className="user-item">
                                            {user.username}
                                            <button
                                                className="btn-add"
                                                onClick={() => sendFriendRequest(user.id)}
                                                title="Add Friend"
                                            >
                                                <FontAwesomeIcon icon={faPlusCircle} />
                                            </button>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className="placeholder-text">No matches found</p>
                            )}
                        </>
                    )}
                </div>
                <div className="friend-requests">
                    <h3>Friend Requests</h3>
                    {friendRequests.length > 0 ? (
                        friendRequests.map(request => (
                            <div key={request.id} className="request-item">
                                    <div className="profile-image-container small">
                                        {request.sender_profile_picture_url ? (
                                            <div className="profile-image">
                                                <img src={`${API_URL}/${request.sender_profile_picture_url}`} alt="Profile" />
                                            </div>
                                        ) : (
                                            <div className="profile-image-placeholder">
                                                <FontAwesomeIcon icon={faUser} size="1x" />
                                            </div>
                                        )}
                                    </div>
                                    {request.sender_username}

                                
                                <div className="button-group">
                                    <button
                                        className="btn-add"
                                        onClick={() => acceptFriendRequest(request.id)}
                                        title="Accept Request"
                                    >
                                        <FontAwesomeIcon icon={faPlusCircle} />
                                    </button>
                                    <button
                                        className="btn-remove"
                                        onClick={() => ignoreFriendRequest(request.id)}
                                        title="Ignore Request"
                                    >
                                        <FontAwesomeIcon icon={faBan} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="placeholder-text">No pending requests</p>
                    )}
                </div>
                <div className="friends-list">
                    <h3>Your Friends</h3>
                    {friends.length > 0 ? (
                        friends.map(friend => (
                            <div key={friend.id} className="friend-item">
                                <div className="friend-info">
                                    <div className="profile-image-container small">
                                        {friend.profile_picture_url ? (
                                            <div className="profile-image">
                                                <img src={`${API_URL}/${friend.profile_picture_url}`} alt="Profile" />
                                            </div>
                                        ) : (
                                            <div className="profile-image-placeholder">
                                                <FontAwesomeIcon icon={faUser} size="1x" />
                                            </div>
                                        )}
                                    </div>
                                    {friend.username}

                                </div>
                                <button
                                    className="btn-remove"
                                    onClick={() => removeFriend(friend.id)}
                                    title="Remove Friend"
                                >
                                    <FontAwesomeIcon icon={faBan} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="placeholder-text">No friends yet</p>
                    )}
                </div>
            </ScrollableContent>
        </div>
    );
}

export default Friends;