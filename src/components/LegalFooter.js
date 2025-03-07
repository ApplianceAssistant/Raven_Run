import React from 'react';
import { Link } from 'react-router-dom';

const LegalFooter = () => {
  return (
    <footer className="legal-footer">
      <div className="legal-links">
        <Link to="/privacy">Privacy Policy</Link>
        <span className="separator">•</span>
        <Link to="/terms">Terms of Service</Link>
      </div>
    </footer>
  );
};

export default LegalFooter;
