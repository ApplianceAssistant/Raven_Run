import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import { API_URL, formatPhoneNumber, compressPhoneNumber, isValidPhoneNumber } from '../utils/utils';
import ScrollableContent from './ScrollableContent';
import '../css/Profile.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit } from '@fortawesome/free-solid-svg-icons';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const CROP_SIZE = 200; // Fixed size for crop box

function Profile() {
  const { user, login } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    profile_picture_url: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setError('Failed to load user data');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Only allow digits and format
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) { // Prevent more than 10 digits
        const formattedPhone = formatPhoneNumber(digitsOnly);
        setProfileData(prev => ({ ...prev, [name]: formattedPhone }));
      }
    } else {
      setProfileData(prev => ({ ...prev, [name]: value || '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File size should not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
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

  const handleImageClick = (e) => {
    e.preventDefault(); // Prevent form submission
    fileInputRef.current.click();
  };

  const handleKeyDown = (e) => {
    // If Enter is pressed and the target is not a button
    if (e.key === 'Enter' && e.target.type !== 'button') {
      e.preventDefault(); // Prevent default form submission
      handleSubmit();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!hasChanges) return;

    // Validate phone number if present
    if (profileData.phone && !isValidPhoneNumber(profileData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('id', user.id);
      console.warn("formdata: ", formData);
      // Append all profile data
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_picture_url') {
          let value = profileData[key];
          // Convert empty strings or 'null' to empty string for optional fields
          if (key === 'phone' && value) {
            value = compressPhoneNumber(value);
          } else if (['first_name', 'last_name', 'phone'].includes(key)) {
            value = (!value || value === 'null') ? '' : value;
          }
          formData.append(key, value);
        }
      });

      // Handle profile picture
      if (imagePreview && imagePreview !== originalData.profile_picture_url) {
        try {
          // Convert data URL to Blob
          const response = await fetch(imagePreview);
          const blob = await response.blob();
          formData.append('profile_picture', blob, 'profile.jpg');
        } catch (error) {
          console.error('Error converting image:', error);
          setError('Failed to process image');
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
          //this is giving an error Unexpected end of JSON input (xhr.responseText empty)
          console.log("xhr.responseText: ", xhr.responseText);
          try {
            const result = JSON.parse(xhr.responseText);
            if (result.success) {
              setSuccess('Profile updated successfully');
              login(result.user);
              setOriginalData(result.user);
              setImagePreview(result.user.profile_picture_url);
            } else {
              setError(result.message || 'Failed to update profile.');
            }
          } catch (error) {
            console.error('Error parsing response:', error, 'Response:', xhr.responseText);
            setError('Failed to process server response');
          }
        } else {
          setError(`Failed to update profile (${xhr.status})`);
        }
      };

      xhr.onerror = function () {
        console.error('XHR error:', xhr.statusText);
        setError('Network error occurred');
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message);
    } finally {
      setUploadProgress(0);
    }
  };

  const skipKeys = ['profile_picture_url', 'id', 'created_at', 'updated_at', 'password', 'total_points'];

  return (
    <div className="content-wrapper">
      <div className="content center">
        <div className="message-display">
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          {uploadProgress > 0 && (
            <div className="upload-progress">
              <progress value={uploadProgress} max="100" />
              <span>{uploadProgress}% Uploaded</span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="profile-form" onKeyDown={handleKeyDown}>
          <div className="profile-image-container">
            {imagePreview ? (
              <div className="profile-image">
                <img src={imagePreview} alt="Profile" />
                <button type="button" className="edit-image-button icon-button" onClick={handleImageClick}>
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
            ) : (
              <div className="profile-image-placeholder" onClick={handleImageClick}>
                <FontAwesomeIcon icon={faUser} size="3x" />
                <p>Profile Image</p>
              </div>
            )}
          </div>
          <div className="profile-buttons">
            <button
              type="submit"
              className={`save-changes-button ${hasChanges ? 'visible' : ''}`}
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          
          <ScrollableContent maxHeight="50vh">
            {Object.entries(profileData).map(([key, value]) => {
              if (!skipKeys.includes(key)) {
                return (
                  <div key={key} className="profile-field">
                    <label htmlFor={key}>{fieldNameMapping[key] || key}:</label>
                    <input
                      type={key === 'email' ? 'email' : 'text'}
                      id={key}
                      name={key}
                      value={key === 'phone' ? formatPhoneNumber(value || '') : (value || '')}
                      onChange={handleInputChange}
                    />
                  </div>
                );
              }
              return null;
            })}
          </ScrollableContent>
        </form>
      </div>
    </div>
  );
}

export default Profile;