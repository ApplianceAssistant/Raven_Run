import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimes } from '@fortawesome/free-solid-svg-icons';
import imageCompression from 'browser-image-compression';
import './ImageUpload.scss';

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MIN_WIDTH = 600;
const MIN_HEIGHT = 400;

// Target size for compression (2MB)
const TARGET_SIZE_MB = 2;
const COMPRESSION_OPTIONS = {
    maxSizeMB: TARGET_SIZE_MB,
    useWebWorker: true,
    preserveExif: true
};

const ImageUpload = ({ onImageChange, currentImage }) => {
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState(currentImage || '');
    const [isCompressing, setIsCompressing] = useState(false);
    const [showModal, setShowModal] = useState(false);

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
            // If file is smaller than target size, no compression needed
            if (file.size <= TARGET_SIZE_MB * 1024 * 1024) {
                return file;
            }

            setIsCompressing(true);
            const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
            setIsCompressing(false);
            return compressedFile;
        } catch (error) {
            console.error('Compression failed:', error);
            setIsCompressing(false);
            // Return original file if compression fails
            return file;
        }
    };

    const processImage = async (file) => {
        try {
            await validateImage(file);
            
            // Compress image if needed
            const processedFile = await compressImageIfNeeded(file);
            
            // Convert to base64
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result;
                setImageSrc(base64data);
                onImageChange(base64data);
                setError('');
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            setError(error.toString());
            setImageSrc('');
        }
    };

    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragActive(false);

        const file = e.dataTransfer?.files?.[0];
        if (file) processImage(file);
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
            processImage(e.target.files[0]);
        }
    };

    const onUploadAreaClick = () => {
        document.getElementById('file-upload').click();
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
                    onClick={onUploadAreaClick}
                    style={{ cursor: 'pointer' }}
                >
                    <FontAwesomeIcon icon={faImage} className="upload-icon" />
                    <p>Drag and drop an image here or click to browse</p>
                    <input
                        type="file"
                        onChange={onSelectFile}
                        accept="image/png, image/jpeg"
                        id="file-upload"
                        className="file-input"
                        style={{ display: 'none' }}
                    />
                    {isCompressing ? (
                        <div className="compression-indicator">
                            <span>Optimizing image...</span>
                        </div>
                    ) : (
                        <div className="upload-prompt">
                            <span className="file-requirements">
                                JPG or PNG, minimum {MIN_WIDTH}x{MIN_HEIGHT}px
                            </span>
                        </div>
                    )}
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
