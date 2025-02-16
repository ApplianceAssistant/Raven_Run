import React from 'react';
import ModalAgreement from './ModalAgreement';

const GameCreatorAgreementModal = ({ isOpen, onAgree }) => {
  const content = (
    <div className="legal-content">
      <section>
        <h2>Game Creator Agreement</h2>
        <p>As a game creator on Crow Tours, you agree to the following terms and responsibilities:</p>
      </section>

      <section>
        <h2>Content Guidelines</h2>
        <p>All created content must:</p>
        <ul>
          <li>Maintain a PG-13 or lower rating at all times</li>
          <li>Be free from nudity, sexual content, and graphic violence</li>
          <li>Be appropriate for all users</li>
          <li>Respect copyright and intellectual property rights</li>
        </ul>
      </section>

      <section>
        <h2>Safety and Location Guidelines</h2>
        <p>When creating location-based challenges:</p>
        <ul>
          <li>Ensure locations are publicly accessible</li>
          <li>Avoid dangerous or restricted areas</li>
          <li>Consider player safety in all weather conditions</li>
          <li>Provide clear and appropriate instructions</li>
        </ul>
      </section>

      <section>
        <h2>Administrative Rights</h2>
        <p>You understand and agree that:</p>
        <ul>
          <li>Administrators have the right to review all created content</li>
          <li>Inappropriate content may be removed without notice</li>
          <li>Repeated violations may result in loss of creation privileges</li>
          <li>All decisions by administrators are final</li>
        </ul>
      </section>

      <section>
        <h2>Quality Standards</h2>
        <p>Created games should:</p>
        <ul>
          <li>Have clear objectives and instructions</li>
          <li>Be tested thoroughly before publishing</li>
          <li>Provide an engaging and fair experience</li>
          <li>Be free from offensive or inappropriate content</li>
        </ul>
      </section>
    </div>
  );

  return (
    <ModalAgreement
      isOpen={isOpen}
      onAgree={onAgree}
      title="Game Creator Agreement"
      content={content}
    />
  );
};

export default GameCreatorAgreementModal;
