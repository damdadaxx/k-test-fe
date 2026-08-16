'use client';

import { LegalParagraph } from '@/components/common/Modal/TermsModals/LegalParagraph';
import { LegalSection } from '@/components/common/Modal/TermsModals/LegalSection';
import { LegalTable } from '@/components/common/Modal/TermsModals/LegalTable';
import {
  TermsModalProps,
  TermsModalShell,
} from '@/components/common/Modal/TermsModals/TermsModalShell';

export function PrivacyModal({ onClose, onAgree }: TermsModalProps) {
  return (
    <TermsModalShell
      title="Collection, use, and overseas transfer of personal data"
      onClose={onClose}
      onAgree={onAgree}
    >
      <LegalSection title="1. Items Collected and Purposes">
        <p className="w-full text-sm font-bold text-icon-90">Required</p>
        <LegalTable
          headers={['Items', 'Purpose', 'Retention']}
          rows={[
            [
              'Email, password',
              'Account creation and login',
              'Until account deletion',
            ],
            [
              'Name (in Latin script), nationality',
              'Score report issuance, eligibility check',
              '1 year after score expiry',
            ],
            [
              'Passport number',
              'Test taker identity verification',
              'Deleted immediately after verification',
            ],
            [
              'Speaking responses (audio)',
              'Scoring and result calculation',
              '1 year after score expiry',
            ],
            [
              'Test screen recording',
              'Misconduct prevention and verification',
              '6 months after test submission',
            ],
            [
              'Payment records',
              'Fee settlement and refunds',
              '5 years (E-Commerce Act)',
            ],
            [
              'IP address, device information, access logs',
              'Fraud detection and security',
              '3 months (Protection of Communications Secrets Act)',
            ],
          ]}
        />
        <p className="w-full text-sm font-bold text-icon-90">Optional</p>
        <LegalTable
          headers={['Items', 'Purpose', 'Retention']}
          rows={[
            [
              'Speaking responses (audio)',
              'Improving scoring model performance',
              'Until consent is withdrawn',
            ],
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Special Provisions on Passport Numbers">
        <LegalParagraph>
          ① A passport number constitutes a unique identifier under the Personal
          Information Protection Act and is stored encrypted, separately from
          other personal data.
        </LegalParagraph>
        <LegalParagraph>
          ② The passport number is used solely to verify the identity of the
          test taker and is deleted immediately upon completion of verification.
        </LegalParagraph>
        <LegalParagraph>
          ③ The Company does not provide passport numbers to any third party.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="3. Domestic Processing Consignment">
        <LegalTable
          headers={['Consignee', 'Consigned Work', 'Location']}
          rows={[
            [
              'K-TEST Scoring Center',
              'Response assessment and scoring',
              'Seoul, Republic of Korea',
            ],
            [
              'Toss Payments Inc.',
              'Test fee payment processing',
              'Seoul, Republic of Korea',
            ],
          ]}
        />
        <LegalParagraph>
          The Company specifies data protection obligations in each consignment
          contract and supervises the consignee&apos;s handling of personal
          data.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Overseas Transfer">
        <LegalTable
          headers={['Recipient', 'Country', 'Items', 'Purpose', 'Retention']}
          rows={[
            [
              'Amazon Web Services, Inc.',
              'Japan (Tokyo)',
              'All required items in Section 1',
              'Service data storage',
              'Same as domestic retention',
            ],
            [
              'Institution designated by the Member',
              'As designated by the Member',
              'Name, nationality, score information',
              'Score report delivery',
              "Per the Institution's own policy",
            ],
          ]}
        />
        <LegalParagraph>
          Timing and method: Transmitted over the network at sign-up and upon
          test submission.
        </LegalParagraph>
        <LegalParagraph>
          Right to refuse and consequences: Members may refuse overseas
          transfer. Refusing the cloud transfer makes use of the Service
          impossible. Transfer to an Institution requires separate consent for
          each case, and refusal does not restrict taking the Test or viewing
          results.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="5. Right to Refuse Consent">
        <LegalParagraph>
          ① Members have the right to refuse consent to the collection and use
          of personal data.
        </LegalParagraph>
        <LegalParagraph>
          ② Refusing consent to required items makes sign-up and taking the Test
          impossible.
        </LegalParagraph>
        <LegalParagraph>
          ③ Refusing consent to optional items imposes no restriction whatsoever
          on taking the Test or receiving results.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="6. Rights of the Data Subject">
        <div className="w-full text-base text-[#333]">
          <p>① Members may exercise the following rights at any time:</p>
          <p>&nbsp;</p>
          <p>• Request access to their personal data</p>
          <p>• Request correction of errors</p>
          <p>• Request deletion</p>
          <p>• Request suspension of processing</p>
          <p>• Withdraw consent</p>
        </div>
        <LegalParagraph>
          ② Requests may be submitted through the Service or at
          privacy@k-test.com. The Company acts on such requests within 10 days.
        </LegalParagraph>
        <LegalParagraph>
          ③ Withdrawal of consent does not affect processing carried out before
          the withdrawal.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="7. Destruction">
        <LegalParagraph>
          ① The Company destroys personal data without delay once the retention
          period has elapsed or the purpose of processing has been achieved.
        </LegalParagraph>
        <LegalParagraph>
          ② Electronic files are permanently deleted by irrecoverable means;
          printed materials are shredded or incinerated.
        </LegalParagraph>
        <LegalParagraph>
          ③ Where retention is required under other laws, such data is stored
          separately.
        </LegalParagraph>
      </LegalSection>
    </TermsModalShell>
  );
}
