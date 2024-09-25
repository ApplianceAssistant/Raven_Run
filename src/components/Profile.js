import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { AuthContext } from '../App';
import { API_URL } from '../utils/utils';
import ScrollableContent from './ScrollableContent';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
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
  const [crop, setCrop] = useState({ unit: 'px', width: CROP_SIZE, height: CROP_SIZE, x: 0, y: 0 });
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      // Handle potential nested objects or arrays
      return JSON.stringify(profileData[key]) !== JSON.stringify(originalData[key]);
    });
    setHasChanges(hasDataChanges || croppedImageUrl !== null);
  }, [profileData, originalData, croppedImageUrl]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/users.php?id=${user.id}`);
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
        setImagePreview(reader.result);
        setIsEditing(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoaded = useCallback((img) => {
    const aspect = 1;
    const width = CROP_SIZE;
    const height = CROP_SIZE;
    const x = (img.width - width) / 2;
    const y = (img.height - height) / 2;
    setCrop({ unit: 'px', width, height, x, y });
  }, []);

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      CROP_SIZE,
      CROP_SIZE
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Canvas is empty');
          return;
        }
        blob.name = 'cropped.jpg';
        const croppedImageUrl = URL.createObjectURL(blob);
        resolve(croppedImageUrl);
      }, 'image/jpeg');
    });
  };

  const handleImageClick = () => {
    console.log("handleImageClick")
    fileInputRef.current.click();
    setIsEditing(true)
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!hasChanges) return;

    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      for (const [key, value] of Object.entries(profileData)) {
        if (key === 'profile_picture_url' && croppedImageUrl) {
          const response = await fetch(croppedImageUrl);
          const blob = await response.blob();
          formData.append(key, blob, 'profile_picture.jpg');
        } else {
          formData.append(key, value);
        }
      }
      formData.append('action', 'update');
      formData.append('id', user.id);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/users.php`, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          if (result.success) {
            setSuccess('Profile updated successfully');
            login(result.user);
            setOriginalData(profileData);
            setCroppedImageUrl(null);
          } else {
            setError(result.message || 'Failed to update profile');
          }
        } else {
          setError('Failed to update profile');
        }
      };

      xhr.onerror = function () {
        setError('Network error occurred');
      };

      xhr.send(formData);
    } catch (error) {
      setError(error.message);
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content center">
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        {uploadProgress > 0 && (
          <div className="upload-progress">
            <progress value={uploadProgress} max="100" />
            <span>{uploadProgress}% Uploaded</span>
          </div>
        )}




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
          <ScrollableContent maxHeight="70vh">
            {Object.entries(profileData).map(([key, value]) => {
              if (key !== 'profile_picture_url') {
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