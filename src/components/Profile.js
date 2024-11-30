import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import { API_URL, formatPhoneNumber, compressPhoneNumber, isValidPhoneNumber } from '../utils/utils';
import ScrollableContent from './ScrollableContent';
import '../css/Profile.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faCog, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import { useMessage } from '../utils/MessageProvider';
import Settings from './Settings';
import Friends from './Friends';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const CROP_SIZE = 200; // Fixed size for crop box

function Profile() {
  const { user, login } = useContext(AuthContext);
  const { showError, showSuccess } = useMessage();
  const fileInputRef = useRef(null);
  const scrollableRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    profile_picture_url: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const fieldNameMapping = {
    username: 'Username',
    email: 'Email',
    phone: 'Phone',
    first_name: 'First Name',
    last_name: 'Last Name',
    profile_picture_url: 'Profile Picture'
  };

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const hasDataChanges = Object.keys(profileData).some(key => {
      return JSON.stringify(profileData[key]) !== JSON.stringify(originalData[key]);
    });
    setHasChanges(hasDataChanges || imagePreview !== originalData.profile_picture_url);
  }, [profileData, originalData, imagePreview]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/users.php?action=get&id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json();

      // Clean up the data - convert 'null' strings and null values to empty strings
      const cleanedData = Object.fromEntries(
        Object.entries(userData).map(([key, value]) => [
          key,
          value === null || value === 'null' ? '' : value
        ])
      );

      // Format phone number before setting state
      const formattedData = {
        ...userData,
        phone: userData.phone ? formatPhoneNumber(userData.phone) : ''
      };

      setProfileData(formattedData);
      setOriginalData(formattedData);
      setImagePreview(userData.profile_picture_url);
    } catch (error) {
      showError('Failed to load user data');
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'phone') {
      console.log("value: ", value);
      // Allow empty value for clearing the field
      if (!value || value.trim() === '') {
        setProfileData(prev => ({ ...prev, [field]: '' }));
        console.log("profileData: ", profileData[field]);
        return;
      }
      // Only allow digits and format for non-empty values
      
      const digitsOnly = value.replace(/\D/g, '');
      console.warn("digitsOnly: ", digitsOnly);
      if (digitsOnly.length <= 10) { // Prevent more than 10 digits
        const formattedPhone = formatPhoneNumber(digitsOnly);
        console.log("formattedPhone: ", formattedPhone);
        setProfileData(prev => ({ ...prev, [field]: formattedPhone }));
      }
    } else {
      setProfileData(prev => ({ ...prev, [field]: value || '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        showError(`File size must be less than 5MB`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        cropAndCenterImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const cropAndCenterImage = (imageDataUrl) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = CROP_SIZE;
      canvas.height = CROP_SIZE;

      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      ctx.drawImage(img, x, y, size, size, 0, 0, CROP_SIZE, CROP_SIZE);

      const croppedImageDataUrl = canvas.toDataURL('image/jpeg');
      setImagePreview(croppedImageDataUrl);
    };
    img.src = imageDataUrl;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!hasChanges) return;

    // Only validate phone number if it's not empty
    if (profileData.phone && !isValidPhoneNumber(profileData.phone)) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }

    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('id', user.id);
      console.log("profileData: ", profileData);
      // Append all profile data
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_picture_url') {
          let value = profileData[key];
          if (key === 'phone' && value) {
            value = compressPhoneNumber(value);
          } else if (['first_name', 'last_name', 'phone'].includes(key)) {
            value = (!value || value === 'null') ? '' : value;
          }
          console.warn("appending: ", key, value);
          formData.append(key, value);
        }
      });

      // Handle profile picture
      if (imagePreview && imagePreview !== originalData.profile_picture_url) {
        try {
          const response = await fetch(imagePreview);
          const blob = await response.blob();
          formData.append('profile_picture', blob, 'profile.jpg');
        } catch (error) {
          console.error('Error converting image:', error);
          showError('Failed to process image');
          return;
        }
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/users.php`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
          if (percentComplete === 100) setUploadProgress(0);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            console.warn("result: ", result);
            if (result.success) {
              showSuccess('Profile updated successfully');
              login(result.user);
              setOriginalData(result.user);
              setImagePreview(result.user.profile_picture_url);
            } else {
              showError(result.message || 'Failed to update profile.');
            }
          } catch (error) {
            console.error('Error parsing response:', error, 'Response:', xhr.responseText);
            showError('Failed to process server response');
          }
        } else {
          showError(`Failed to update profile (${xhr.status})`);
        }
      };

      xhr.onerror = function () {
        console.error('XHR error:', xhr.statusText);
        showError('Network error occurred');
      };
      console.warn("formData: ", formData);

      xhr.send(formData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      showError(error.message);
    } finally {
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setImagePreview(originalData.profile_picture_url);
  };

  return (
    <div className="profile-container">
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FontAwesomeIcon icon={faUser} /> Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FontAwesomeIcon icon={faCog} /> Settings
        </button>
        <button
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => setActiveTab('friends')}
        >
          <FontAwesomeIcon icon={faUserFriends} /> Friends
        </button>
      </div>

      <ScrollableContent maxHeight="calc(100vh - 250px)">
        <div className="tab-content">
          {activeTab === 'profile' && (
            <>
              <div className="profile-header">
                <div className="profile-picture-container">
                  <div className="profile-picture">
                    {profileData.profile_picture_url || imagePreview ? (
                      <img
                        src={imagePreview || `${API_URL}/uploads/${profileData.profile_picture_url}`}
                        alt="Profile"
                        className="profile-image"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUser} className="default-profile-icon" />
                    )}
                  </div>
                  <button className="edit-picture-button" onClick={() => fileInputRef.current.click()}>
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <h2>{profileData.username || 'Loading...'}</h2>
              </div>

              <form className="profile-form" onSubmit={handleSubmit}>
                {hasChanges && (
                  <div className="button-group">
                    <button type="submit" className="save-button">
                      Save Changes
                    </button>
                    <button type="button" className="cancel-button" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                )}
                {Object.entries(fieldNameMapping).map(([field, label]) => {
                  if (field === 'profile_picture_url') return null;
                  return (
                    <div key={field} className="form-group">
                      <label htmlFor={field}>{label}:</label>
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        id={field}
                        value={profileData[field]}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        disabled={field === 'email'}
                      />
                    </div>
                  );
                })}
              </form>
            </>
          )}
          {activeTab === 'settings' && <Settings />}
          {activeTab === 'friends' && <Friends />}
        </div>
      </ScrollableContent>
    </div>
  );
}

export default Profile;