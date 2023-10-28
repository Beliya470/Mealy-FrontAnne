import React from 'react';
import './Modal.css';  // Optional: Add styles for the Modal

const Modal = ({ children, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                {children}
                <button onClick={onClose} className="modal-close-button">Close</button>
            </div>
        </div>
    );
};

export default Modal;
