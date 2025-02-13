import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimes } from '@fortawesome/free-solid-svg-icons';
import './ImageUpload.scss';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MIN_WIDTH = 600;
const MIN_HEIGHT = 315;

const ImageUpload = ({ onImageChange, currentImage }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState(currentImage || '');
    const [showModal, setShowModal] = useState(false);

    const validateImage = (file) => {
        return new Promise((resolve, reject) => {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                reject('Please upload a JPG or PNG file');
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                reject('File size must be less than 2MB');
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

    const handleFile = async (file) => {
        try {
            await validateImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
                onImageChange(e.target.result);
                setError('');
            };
            reader.readAsDataURL(file);
        } catch (err) {
            setError(err);
        }
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer?.files?.[0];
        if (file) handleFile(file);
    }, []);

    const onDragOver = useCallback((e) => {
        e.preventDefault();
        setDragActive(true);
    }, []);

    const onDragLeave = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);
    }, []);

    const onSelectFile = (e) => {
        if (e.target.files?.[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const removeImage = () => {
        setImageSrc('');
        onImageChange('');
        setShowModal(false);
    };

    return (
        <div className="image-upload-container">
            {error && <div className="error-message">{error}</div>}
            
            {!imageSrc ? (
                <div
                    className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                >
                    <FontAwesomeIcon icon={faImage} className="upload-icon" />
                    <p>Drag and drop an image here or</p>
                    <input
                        type="file"
                        onChange={onSelectFile}
                        accept="image/png, image/jpeg"
                        id="file-upload"
                        className="file-input"
                    />
                    <label htmlFor="file-upload" className="file-label">
                        Choose a file
                    </label>
                </div>
            ) : (
                <div className="image-preview-container">
                    <div className="image-preview">
                        <img 
                            src={imageSrc} 
                            alt="Preview" 
                            className="preview-image" 
                            onClick={() => setShowModal(true)}
                        />
                    </div>
                </div>
            )}

            {showModal && (
                <div className="image-modal" onClick={(e) => {
                    if (e.target === e.currentTarget) setShowModal(false);
                }}>
                    <div className="modal-content">
                        <button className="close-button" onClick={() => setShowModal(false)}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                        <div className="modal-body">
                            <img src={imageSrc} alt="Full size" className="modal-image" />
                        </div>
                        <div className="modal-footer">
                            <button className="remove-button" onClick={removeImage}>
                                Remove Image
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
