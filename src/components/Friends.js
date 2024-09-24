import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import { API_URL } from '../utils/utils';
import ScrollableContent from './ScrollableContent';

function Friends() {
  const { user } = useContext(AuthContext);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${API_URL}/friends.php?action=get_friends&user_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data.friends);
    } catch (error) {
      setError('Failed to load friends');
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/friends.php?action=get_friend_requests&user_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch friend requests');
      const data = await response.json();
      setFriendRequests(data.friend_requests);
    } catch (error) {
      setError('Failed to load friend requests');
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`${API_URL}/friends.php?action=search_users&query=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to search users');
      const data = await response.json();
      setSearchResults(data.users);
    } catch (error) {
      setError('Failed to search users');
    }
  };

  const sendFriendRequest = async (friendId) => {
    try {
      const response = await fetch(`${API_URL}/friends.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_friend_request',
          sender_id: user.id,
          receiver_id: friendId
        })
      });
      if (!response.ok) throw new Error('Failed to send friend request');
      // Update UI or show success message
    } catch (error) {
      setError('Failed to send friend request');
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const response = await fetch(`${API_URL}/friends.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept_friend_request',
          request_id: requestId
        })
      });
      if (!response.ok) throw new Error('Failed to accept friend request');
      fetchFriends();
      fetchFriendRequests();
    } catch (error) {
      setError('Failed to accept friend request');
    }
  };

  return (
    <div className="content-wrapper">
      <div className="spirit-guide large">
        <div className="content">
          <h1 className="contentHeader">Friends</h1>
          <ScrollableContent maxHeight="60vh">
            {error && <p className="error-message">{error}</p>}
            <div className="friends-search">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users"
              />
              <button onClick={handleSearch}>Search</button>
            </div>
            <div className="search-results">
              {searchResults.map(user => (
                <div key={user.id} className="user-item">
                  {user.username}
                  <button onClick={() => sendFriendRequest(user.id)}>Add Friend</button>
                </div>
              ))}
            </div>
            <div className="friend-requests">
              <h2>Friend Requests</h2>
              {friendRequests.map(request => (
                <div key={request.id} className="request-item">
                  {request.sender_username}
                  <button onClick={() => acceptFriendRequest(request.id)}>Accept</button>
                </div>
              ))}
            </div>
            <div className="friends-list">
              <h2>Your Friends</h2>
              {friends.map(friend => (
                <div key={friend.id} className="friend-item">
                  {friend.username}
                </div>
              ))}
            </div>
          </ScrollableContent>
        </div>
      </div>
    </div>
  );
}

export default Friends;