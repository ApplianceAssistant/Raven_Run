import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import ImageUpload from '../ImageUpload/ImageUpload';
import { useMessage } from '../../../../utils/MessageProvider';
import { deleteGameImage } from '../../services/gameCreatorService';
import './ImageUploadModal.scss';

const ImageUploadModal = ({ isOpen, onClose, onImageChange, currentImage, gameId }) => {
    const { showError, showSuccess } = useMessage();
    
    if (!isOpen) return null;

    const handleImageChange = (image_data) => {
        onImageChange(image_data);
        onClose();
    };

    const handleImageDelete = async () => {
        try {
            await deleteGameImage(gameId);
            // Update local state by passing empty values for both image_url and image_data
            onImageChange({ image_url: '', image_data: '' });
            showSuccess('Image removed successfully');
            onClose();
        } catch (error) {
            console.error('Error deleting image:', error);
            showError(error.message || 'Failed to remove image');
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCloseClick = (e) => {
        e.stopPropagation();
        onClose();
    };

    return (
        <div className={`modal-overlay ${isOpen ? 'visible' : ''}`} onClick={handleOverlayClick}>
            <div className={`modal-content ${isOpen ? 'visible' : ''}`}>
                <div className="image-modal-header">
                    <h2>Game Cover Image</h2>
                    <button className="close-button" onClick={handleCloseClick}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                <div className="modal-body">
                    <div className="image-preview-container">
                        {currentImage && (
                            <div className="current-image-preview">
                                <img src={currentImage} alt="Current game cover" />
                                <div className="image-actions">
                                    <button 
                                        className="remove-button"
                                        onClick={handleImageDelete}
                                    >
                                        Remove
                                    </button>
                                    <button 
                                        className="cancel-button"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        {!currentImage && (
                            <ImageUpload
                                onImageChange={handleImageChange}
                                currentImage={currentImage}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageUploadModal;
