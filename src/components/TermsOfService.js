import React from 'react';
import ScrollableContent from './ScrollableContent';

const TermsOfService = ({ asModal }) => {
  const content = (
    <div className="text-content-page">
      <h1>Terms of Service</h1>

      <section>
        <h2>Acceptance of Terms</h2>
        <p>By accessing or using Crow Tours, you agree to be bound by these Terms of Service. Please read them carefully before proceeding.</p>
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
        <h2>Disclaimer and Limitation of Liability</h2>
        <p>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU AGREE THAT:</p>
        
        <ol>
          <li>NEITHER CROW TOURS, ITS CREATORS, AFFILIATES, LICENSORS, PARTNERS, OR ANY OF THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS (COLLECTIVELY, THE "RELEASED PARTIES") WILL BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO:</li>
          <ul>
            <li>DAMAGES FOR LOSS OF PROFITS</li>
            <li>GOODWILL</li>
            <li>USE</li>
            <li>DATA</li>
            <li>PERSONAL INJURY</li>
            <li>PROPERTY DAMAGE</li>
            <li>EMOTIONAL DISTRESS</li>
            <li>ANY OTHER INTANGIBLE OR TANGIBLE LOSSES</li>
          </ul>
          
          <li>THIS LIMITATION OF LIABILITY APPLIES TO ALL CLAIMS, WHETHER BASED ON WARRANTY, CONTRACT, TORT, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT THE RELEASED PARTIES HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE.</li>
          
          <li>BY USING THE APPLICATION, YOU SPECIFICALLY ACKNOWLEDGE AND AGREE THAT THE RELEASED PARTIES SHALL NOT BE LIABLE FOR ANY:</li>
          <ul>
            <li>USER CONTENT OR CONDUCT</li>
            <li>DEFAMATORY, OFFENSIVE, OR ILLEGAL CONDUCT OF ANY THIRD PARTY</li>
            <li>PHYSICAL INJURIES OR PROPERTY DAMAGE RESULTING FROM YOUR USE OF THE SERVICE</li>
            <li>ACCIDENTS, INJURIES, OR INCIDENTS THAT MAY OCCUR DURING LOCATION-BASED CHALLENGES</li>
            <li>TECHNICAL FAILURES OR MALFUNCTIONS</li>
            <li>LOST, STOLEN, OR DAMAGED DEVICES OR PROPERTY</li>
            <li>ANY ACTIONS OR DECISIONS MADE BASED ON INFORMATION PROVIDED BY THE SERVICE</li>
          </ul>
        </ol>

        <p>IN NO EVENT SHALL THE AGGREGATE LIABILITY OF THE RELEASED PARTIES ARISING OUT OF OR RELATING TO THE USE OF THE SERVICE EXCEED THE GREATER OF $100 OR THE AMOUNT YOU HAVE PAID TO USE THE SERVICE IN THE PAST TWELVE MONTHS.</p>

        <p>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.</p>

        <h3>Indemnification</h3>
        <p>You agree to defend, indemnify, and hold harmless the Released Parties from and against any claims, liabilities, damages, losses, and expenses, including, without limitation, reasonable legal and accounting fees, arising out of or in any way connected with:</p>
        <ul>
          <li>Your access to or use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party right, including without limitation any intellectual property right, publicity, confidentiality, property, or privacy right</li>
          <li>Any claims or damages that arise as a result of your User Content or any content that you share through the Service</li>
        </ul>

        <h3>Assumption of Risk</h3>
        <p>YOU EXPRESSLY UNDERSTAND AND AGREE THAT YOUR USE OF THE SERVICE, INCLUDING PARTICIPATION IN LOCATION-BASED CHALLENGES, IS AT YOUR SOLE RISK. YOU ASSUME FULL RESPONSIBILITY FOR ALL RISKS ARISING FROM YOUR USE OF THE SERVICE, INCLUDING BUT NOT LIMITED TO THE RISKS OF:</p>
        <ul>
          <li>PHYSICAL INJURY</li>
          <li>CONTACT WITH OTHER PARTICIPANTS OR THIRD PARTIES</li>
          <li>TRAVELING TO AND FROM CHALLENGE LOCATIONS</li>
          <li>ENCOUNTERING UNEXPECTED TERRAIN OR WEATHER CONDITIONS</li>
        </ul>

        <p>BY USING THE SERVICE, YOU VOLUNTARILY AGREE TO EXPRESSLY ASSUME ALL RISKS OF INJURY OR DAMAGE ARISING FROM YOUR USE OF THE SERVICE, WHETHER SUCH RISKS ARE KNOWN OR UNKNOWN, DISCLOSED OR UNDISCLOSED.</p>
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
