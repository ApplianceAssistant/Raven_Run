import React from 'react';
import ScrollableContent from './ScrollableContent';

const PrivacyPolicy = ({ asModal }) => {
  const content = (
    <div className="text-content-page">
      <h1>Privacy Policy</h1>
      
      <section>
        <h2>Introduction</h2>
        <p>At Raven Run, we highly value and protect your personal information and privacy. This Privacy Policy explains how we collect, use, and safeguard your information while providing an enjoyable gaming experience.</p>
      </section>

      <section>
        <h2>Information We Collect</h2>
        <ul>
          <li>Email address - Used for account creation and optional content updates</li>
          <li>Location data - Used solely for gameplay purposes in location-based challenges</li>
          <li>Profile information - Basic details to identify you as an authorized user</li>
          <li>Game-related data - Your progress, created content, and gameplay information</li>
        </ul>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <p>We only collect information that is necessary to provide you with a secure and enjoyable gaming experience. Your information is used exclusively for:</p>
        <ul>
          <li>Managing your account and ensuring secure access</li>
          <li>Enabling game functionality and features</li>
          <li>Providing location-based challenges during gameplay</li>
          <li>Sending important updates about the service (when opted in)</li>
        </ul>
      </section>

      <section>
        <h2>Data Storage</h2>
        <p>To enable offline functionality, we store the following information on your device:</p>
        <ul>
          <li>User profile information for offline authentication</li>
          <li>Downloaded games and challenges</li>
          <li>Games and content you are creating</li>
          <li>Your preferences and settings</li>
        </ul>
      </section>

      <section>
        <h2>Data Protection</h2>
        <p>We are committed to protecting your data:</p>
        <ul>
          <li>Your personal information is never shared with third parties</li>
          <li>Data is retained indefinitely unless you request deletion</li>
          <li>We implement appropriate security measures to protect your information</li>
        </ul>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Request deletion of your data</li>
          <li>Access your stored information</li>
          <li>Update your preferences</li>
        </ul>
        <p>To exercise these rights, please contact us through your registered email address.</p>
      </section>

      <section>
        <h2>Updates to Privacy Policy</h2>
        <p>We may update this privacy policy to reflect changes in our practices. We will notify users of any material changes.</p>
      </section>
    </div>
  );

  if (asModal) {
    return content;
  }

  return (
    <div className="page-container">
      <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 90)">
        {content}
      </ScrollableContent>
    </div>
  );
};

export default PrivacyPolicy;
