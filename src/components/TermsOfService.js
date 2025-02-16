import React from 'react';
import ScrollableContent from './ScrollableContent';

const TermsOfService = ({ asModal }) => {
  const content = (
    <div className="text-content-page">
      <h1>Terms of Service</h1>

      <section>
        <h2>Acceptance of Terms</h2>
        <p>By accessing or using Raven Run, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.</p>
      </section>

      <section>
        <h2>User Content Guidelines</h2>
        <p>All content must maintain a PG-13 or lower rating. The following are strictly prohibited:</p>
        <ul>
          <li>Nudity or sexually explicit content</li>
          <li>Graphic violence</li>
          <li>Hate speech or discriminatory content</li>
          <li>Content that violates others' rights</li>
        </ul>
        <p>Administrators reserve the right to review and remove any inappropriate content without prior notice.</p>
      </section>

      <section>
        <h2>User Responsibilities</h2>
        <ul>
          <li>Maintain the security of your account credentials</li>
          <li>Create appropriate content within guidelines</li>
          <li>Respect other users and their experience</li>
          <li>Report inappropriate content or behavior</li>
        </ul>
      </section>

      <section>
        <h2>Game Content and Conduct</h2>
        <p>When participating in or creating games:</p>
        <ul>
          <li>Follow all local laws and regulations</li>
          <li>Respect private property and restricted areas</li>
          <li>Consider safety and appropriateness of locations</li>
          <li>Create challenges that are inclusive and appropriate for all users</li>
        </ul>
      </section>

      <section>
        <h2>Data Usage and Privacy</h2>
        <ul>
          <li>Location data is used only for gameplay purposes</li>
          <li>Personal information is protected as detailed in our Privacy Policy</li>
          <li>Offline functionality stores necessary data on your device</li>
        </ul>
      </section>

      <section>
        <h2>Modifications and Termination</h2>
        <p>We reserve the right to:</p>
        <ul>
          <li>Modify these terms with notice to users</li>
          <li>Terminate accounts that violate these terms</li>
          <li>Remove content that violates these guidelines</li>
        </ul>
      </section>

      <section>
        <h2>Contact</h2>
        <p>If you have questions about these terms or need to report violations, please contact us through the app's support system.</p>
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

export default TermsOfService;
