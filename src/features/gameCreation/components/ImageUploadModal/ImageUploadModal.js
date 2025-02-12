import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ImageUpload from '../ImageUpload/ImageUpload';
import './ImageUploadModal.scss';

const ImageUploadModal = ({ isOpen, onClose, onImageChange, currentImage }) => {
    if (!isOpen) return null;

    const handleImageChange = (image_data) => {
        onImageChange(image_data);
        onClose();
    };

    const handleOverlayClick = (e) => {
        // Only close if clicking the overlay itself
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCloseClick = (e) => {
        e.stopPropagation(); // Prevent event from bubbling to overlay
        onClose();
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'visible' : ''}`} onClick={handleOverlayClick}>
            <div className={`modal-content ${isOpen ? 'visible' : ''}`}>
                <div className="modal-header">
                    <h2>Upload Game Cover Image</h2>
                    <button className="close-button" onClick={handleCloseClick}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className="modal-body">
                    <ImageUpload
                        onImageChange={handleImageChange}
                        currentImage={currentImage}
                    />
                </div>
                <div className="modal-footer">
                    <button className="secondary-button" onClick={handleCloseClick}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;
