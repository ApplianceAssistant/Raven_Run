import React from 'react';
import ScrollableContent from './ScrollableContent';

function Contact() {
  return (
    <div className="text-content-page">
      <h1>Have a Question?</h1>
      <ScrollableContent maxHeight="calc(var(--content-vh, 1vh) * 60)">
        <section>
          <p>Hello! We're excited to have you join our community of urban explorers and puzzle enthusiasts.</p>
          <p>For any questions, issues, or feedback about Crow Tours, please visit our Facebook page. We're actively monitoring it and look forward to hearing from you!</p>
          <p>
            <a
              href="https://www.facebook.com/CrowTours/"
              target="_blank"
              description="Crow Tours Facebook Page"
              rel="noopener noreferrer"
            >
              Visit our Facebook Page
            </a>
          </p>
          <p>Your input is invaluable as we continue to improve and expand Crow Tours. Thank you for being part of our journey!</p>
        </section>
      </ScrollableContent>
    </div>
  );
}

export default Contact;