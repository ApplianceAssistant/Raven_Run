import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import { API_URL, formatPhoneNumber, compressPhoneNumber, isValidPhoneNumber, authFetch } from '../utils/utils';
import ScrollableContent from './ScrollableContent';
import '../css/Profile.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faCog, faUserFriends, faImage, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useMessage } from '../utils/MessageProvider';
import Settings from './Settings';
import Friends from './Friends';
import { useNavigate, useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB to match GameForm
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;
const TARGET_SIZE_MB = 2;

const COMPRESSION_OPTIONS = {
    maxSizeMB: TARGET_SIZE_MB,
    useWebWorker: true,
    preserveExif: true
};

const MAX_FILE_SIZE_FOR_CROP = 5 * 1024 * 1024; // 5MB
const CROP_SIZE = 200; // Fixed size for crop box

function Profile() {
  const { user, login } = useContext(AuthContext);
  const { showError, showSuccess } = useMessage();
  const fileInputRef = useRef(null);
  const scrollableRef = useRef(null);
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || 'profile');
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
    username: 'Trail Name',
    email: 'Email',
    phone: 'Phone',
    first_name: 'First Name',
    last_name: 'Last Name',
    profile_picture_url: 'Profile Picture'
  };

  useEffect(() => {
    setActiveTab(tab || 'profile');
  }, [tab]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    const hasDataChanges = Object.keys(profileData).some(key => {
      return JSON.stringify(profileData[key]) !== JSON.stringify(originalData[key]);
    });
    setHasChanges(hasDataChanges || imagePreview !== originalData.profile_picture_url);
  }, [profileData, originalData, imagePreview]);

  const fetchUserData = async () => {
    try {
      const response = await authFetch(`${API_URL}/server/api/users/users.php?action=get&id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json();

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
      // Allow empty value for clearing the field
      if (!value || value.trim() === '') {
        setProfileData(prev => ({ ...prev, [field]: '' }));
        return;
      }
      // Only allow digits and format for non-empty values

      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length <= 10) { // Prevent more than 10 digits
        const formattedPhone = formatPhoneNumber(digitsOnly);
        setProfileData(prev => ({ ...prev, [field]: formattedPhone }));
      }
    } else {
      setProfileData(prev => ({ ...prev, [field]: value || '' }));
    }
  };

  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        reject('Please upload a JPG or PNG file');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        reject('File size must be less than 4MB');
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
          reject(`Image must be at least ${MIN_WIDTH}x${MIN_HEIGHT} pixels`);
          return;
        }
        resolve(true);
      };
      img.onerror = () => reject('Failed to load image');
      img.src = URL.createObjectURL(file);
    });
  };

  const compressImageIfNeeded = async (file) => {
    try {
      if (file.size <= TARGET_SIZE_MB * 1024 * 1024) {
        return file;
      }

      setUploadProgress(-1); // Show indeterminate progress
      const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
      setUploadProgress(0);
      return compressedFile;
    } catch (error) {
      console.error('Compression failed:', error);
      setUploadProgress(0);
      return file;
    }
  };

  const handleImageSelect = async (file) => {
    try {
      await validateImage(file);
      const processedFile = await compressImageIfNeeded(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        cropAndCenterImage(reader.result);
      };
      reader.readAsDataURL(processedFile);

    } catch (error) {
      showError(error.toString());
    }
  };

  const onUploadAreaClick = () => {
    document.getElementById('profile-image-upload').click();
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      // Prepare the data object
      const data = {
        action: 'update',
        id: user.id
      };

      // Add all profile data except profile picture
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_picture_url') {
          let value = profileData[key];
          if (key === 'phone' && value) {
            value = compressPhoneNumber(value);
          } else if (['first_name', 'last_name', 'phone'].includes(key)) {
            value = (!value || value === 'null') ? '' : value;
          }
          value = value ?? '';
          data[key] = value;
        }
      });

      // Handle profile picture
      if (imagePreview && imagePreview !== originalData.profile_picture_url) {
        try {
          const response = await fetch(imagePreview);
          const blob = await response.blob();
          // Convert blob to base64
          const reader = new FileReader();
          const base64Data = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          // Add the base64 image data to the request
          data.profile_picture = base64Data;
        } catch (error) {
          console.error('Error converting image:', error);
          showError('Failed to process image');
          return;
        }
      }

      const response = await authFetch(`${API_URL}/server/api/users/users.php`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        showSuccess('Profile updated successfully');
        // Update the local state directly instead of triggering a re-fetch
        const updatedUser = { ...user, ...result.user };
        const formattedData = {
          ...result.user,
          phone: result.user.phone ? formatPhoneNumber(result.user.phone) : ''
        };

        login(updatedUser);
        setOriginalData(formattedData);
        setProfileData(formattedData);
        setImagePreview(result.user.profile_picture_url);
        setHasChanges(false);

      } else {
        showError(result.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      showError(error.message || 'Failed to update profile');
    } finally {
      setUploadProgress(0);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setImagePreview(originalData.profile_picture_url);
    setHasChanges(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/profile/${tab}`);
  };

  return (
    <div className="profile-container">
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          <FontAwesomeIcon icon={faUser} /> Profile
        </button>
        <button
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleTabChange('settings')}
        >
          <FontAwesomeIcon icon={faCog} /> Settings
        </button>
        <button
          className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
          onClick={() => handleTabChange('friends')}
        >
          <FontAwesomeIcon icon={faUserFriends} /> Friends
        </button>
      </div>


      <div className="tab-content">

        {activeTab === 'profile' && (
          <ScrollableContent dependencies={[activeTab]} maxHeight="calc(var(--content-vh, 1vh) * 80)">
            <div className="profile-content">
              <div className="profile-header">
                <div 
                  className="profile-picture-container"
                  onClick={onUploadAreaClick}
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                >
                  {uploadProgress === -1 ? (
                    <div className="compression-indicator">
                      <span>Optimizing image...</span>
                    </div>
                  ) : imagePreview ? (
                    <>
                      <img 
                        src={imagePreview} 
                        alt="Profile" 
                        className="profile-image" 
                      />
                      <button 
                        className="edit-picture-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </>
                  ) : (
                    <div className="upload-prompt">
                      <FontAwesomeIcon icon={faImage} className="upload-icon" />
                      <span className="upload-text">Click or drop image here</span>
                    </div>
                  )}
                  <input
                    type="file"
                    id="profile-image-upload"
                    onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                    accept={ACCEPTED_TYPES.join(',')}
                    style={{ display: 'none' }}
                  />
                </div>
                <h2>{profileData.username || 'Loading...'}</h2>
              </div>

              <form className="profile-form" onSubmit={handleSubmit}>
                {hasChanges && (
                  <div className={`button-group ${hasChanges ? 'visible' : ''}`}>
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
                        value={profileData[field] || ''}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        disabled={field === 'email'}
                      />
                    </div>
                  );
                })}
              </form>
            </div>
          </ScrollableContent>
        )}
        {activeTab === 'settings' && (
            <Settings />
        )}
        {activeTab === 'friends' && (
          <Friends />
        )}
      </div>

    </div>
  );
}

export default Profile;