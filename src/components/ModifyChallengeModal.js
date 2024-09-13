import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <div className="modal-body">
        <p>{message}</p>
        <div className="modal-buttons">
          <button onClick={onConfirm}>Create New Challenge</button>
          <button onClick={onCancel}>Modify Current Challenge</button>
          <button onClick={onClose}>Cancel</button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;