import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../App';
import { API_URL } from '../utils/utils';
import ScrollableContent from './ScrollableContent';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import '../css/Profile.scss';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const TARGET_WIDTH = 500;
const TARGET_HEIGHT = 500;

function Profile() {
  const { user, login } = useContext(AuthContext);
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    profile_picture_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);

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

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/users.php?id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json();
      setProfileData(userData);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoaded = useCallback((img) => {
    const aspect = TARGET_WIDTH / TARGET_HEIGHT;
    const width = img.width;
    const height = width / aspect;
    setCrop({ unit: 'px', width, height, x: 0, y: 0 });
  }, []);

  const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      TARGET_WIDTH,
      TARGET_HEIGHT
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

  const handleCropComplete = async (crop, pixelCrop) => {
    if (imagePreview && pixelCrop.width && pixelCrop.height) {
      const croppedImageUrl = await getCroppedImg(
        document.getElementById('source-image'),
        pixelCrop
      );
      setCroppedImageUrl(croppedImageUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
            setIsEditing(false);
            login(result.user);
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
        <div className="profile-buttons">
          {isEditing ? (
            <button type="submit">Save Changes</button>
          ) : (
            <button type="button" onClick={() => setIsEditing(true)}>Save Changes</button>
          )}
        </div>
        
        <ScrollableContent maxHeight="70vh">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="profile-image-upload profile-field">
              <label htmlFor="profile_picture_url">Profile Picture:</label>
              {imagePreview && (
                <ReactCrop
                  src={imagePreview}
                  crop={crop}
                  onChange={(newCrop) => setCrop(newCrop)}
                  onComplete={handleCropComplete}
                  onImageLoaded={onImageLoaded}
                >
                  <img id="source-image" src={imagePreview} alt="Profile Preview" />
                </ReactCrop>
              )}
              <input
                type="file"
                id="profile_picture_url"
                name="profile_picture_url"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
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
                    />
                  </div>
                );
              }
              return null;
            })}
          </form>
        </ScrollableContent>
      </div>
    </div>
  );
}

export default Profile;