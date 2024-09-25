import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import { API_URL } from '../utils/utils';
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
      setProfileData(userData);
      setOriginalData(userData);
      setImagePreview(userData.profile_picture_url);
    } catch (error) {
      setError('Failed to load user data');
    }
  };

  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
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

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!hasChanges) return;
  
    setError('');
    setSuccess('');
    setUploadProgress(0);
  
    try {
      const formData = new FormData();
      formData.append('action', 'update');
      formData.append('id', user.id);
  
      // Append all profile data
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_picture_url') {
          formData.append(key, profileData[key]);
        }
      });
  
      // Handle profile picture
      if (imagePreview !== originalData.profile_picture_url) {
        console.log("not a match, update profile picture");
        // Convert the image preview to a Blob
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        console.log('Image blob size:', blob.size);
        formData.append('profile_picture_url', blob, 'profile_picture.jpg');
      }
      console.log("formData:", formData);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/users.php`, true);
  
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
          if(percentComplete === 100) setUploadProgress(0);
        }
      };
  
      xhr.onload = function () {
        console.log('XHR response:', xhr.responseText);
        if (xhr.status === 200) {
          console.log("xhr.responseText:", xhr.responseText);
          const result = JSON.parse(xhr.responseText);
          console.warn("result:", result);
          if (result.success) {
            setSuccess('Profile updated successfully');
            login(result.user);
            setOriginalData(result.user);
            setImagePreview(result.user.profile_picture_url);
          } else {
            setError(result.message || 'Failed to update profile. result:', result);
          }
        } else {
          setError('Failed to update profile status:' + xhr.status);
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
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-image-container">
            {imagePreview ? (
              <div className="profile-image">
                <img src={imagePreview} alt="Profile" />
                <span className="edit-image-button" onClick={handleImageClick}>
                  <FontAwesomeIcon icon={faEdit} />
                </span>
              </div>
            ) : (
              <div className="profile-image-placeholder" onClick={handleImageClick}>
                <FontAwesomeIcon icon={faUser} size="3x" />
                <p>Your profile photo here</p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <div className="profile-buttons">
            <button
              type="submit"
              onClick={handleSubmit}
              className={`save-changes-button ${hasChanges ? 'visible' : ''}`}
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
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
                      value={value || ''}
                      onChange={handleInputChange}
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
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