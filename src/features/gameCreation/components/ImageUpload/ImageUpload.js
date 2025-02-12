import React, { useState, useCallback } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimes } from '@fortawesome/free-solid-svg-icons';
import './ImageUpload.scss';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MIN_WIDTH = 600;
const MIN_HEIGHT = 315;
const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 630;

const ImageUpload = ({ onImageChange, currentImage }) => {
    console.log('Rendering ImageUpload with currentImage:', currentImage);

    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [crop, setCrop] = useState({
        unit: '%',
        width: 100,
        aspect: 16 / 9
    });
    const [imageSrc, setImageSrc] = useState(currentImage || '');
    const [imageRef, setImageRef] = useState(null);

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

    const getCroppedImg = useCallback(async () => {
        if (!imageRef || !crop.width || !crop.height) return;

        const canvas = document.createElement('canvas');
        const scaleX = imageRef.naturalWidth / imageRef.width;
        const scaleY = imageRef.naturalHeight / imageRef.height;
        
        canvas.width = TARGET_WIDTH;
        canvas.height = TARGET_HEIGHT;
        
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(
            imageRef,
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
            canvas.toBlob(
                (blob) => {
                    if (!blob) return;
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        onImageChange(reader.result);
                        resolve(reader.result);
                    };
                    reader.readAsDataURL(blob);
                },
                'image/jpeg',
                0.9
            );
        });
    }, [imageRef, crop, onImageChange]);

    const clearImage = () => {
        setImageSrc('');
        onImageChange('');
    };

    return (
        <div className="image-upload">
            {!imageSrc ? (
                <div
                    className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onClick={() => document.querySelector('.file-input').click()}
                >
                    <input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={onSelectFile}
                        className="file-input"
                        style={{ display: 'none' }}
                    />
                    <FontAwesomeIcon icon={faImage} className="upload-icon" />
                    <p>Drag and drop an image here or click to upload</p>
                    <p className="file-requirements">
                        JPG or PNG, max 2MB, minimum {MIN_WIDTH}x{MIN_HEIGHT}px
                    </p>
                    {error && <p className="error-message">{error}</p>}
                </div>
            ) : (
                <div className="image-preview">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        aspect={16/9}
                    >
                        <img
                            ref={setImageRef}
                            src={imageSrc}
                            alt="Upload preview"
                            style={{ maxWidth: '100%' }}
                        />
                    </ReactCrop>
                    <div className="image-actions">
                        <button 
                            className="save-crop-button" 
                            onClick={getCroppedImg}
                            disabled={!imageRef || !crop.width || !crop.height}
                        >
                            Save Crop
                        </button>
                        <button 
                            className="clear-button" 
                            onClick={clearImage}
                        >
                            <FontAwesomeIcon icon={faTimes} /> Clear
                        </button>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
