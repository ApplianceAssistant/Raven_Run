import React, { useState, useRef, useEffect } from 'react';

function Home() {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const modalRef = useRef(null);

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  // Function to handle saving the form data
  const handleSave = () => {
    // Implement your save logic here
    // For this example, we'll just close the modal
    toggleModal();
  };

  // Function to handle clicking outside the modal to close it
  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      toggleModal();
    }
  };

  // Add a click event listener to handle clicks outside the modal
  useEffect(() => {
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  return (
    <div className="main-container">
      <div className="home content">
        <h1>Welcome to Ravens Run!</h1>
        <button onClick={toggleModal}>Show Modal</button>
        {showModal && (
          <div className="modal">
            <div className="modal-content" ref={modalRef}>
              <span className="close-icon" onClick={toggleMenu}>
                &#x2716;
              </span>
              <h2>Modal Title</h2>
              <p>Modal Content:</p>
              <textarea
                rows="4"
                cols="50"
                value={modalContent}
                onChange={(e) => setModalContent(e.target.value)}
              />
              <button onClick={handleSave}>Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
