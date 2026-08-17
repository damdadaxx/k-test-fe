'use client';

import { LegalParagraph } from '@/components/common/Modal/TermsModals/LegalParagraph';
import { LegalSection } from '@/components/common/Modal/TermsModals/LegalSection';
import { LegalTable } from '@/components/common/Modal/TermsModals/LegalTable';
import {
  TermsModalProps,
  TermsModalShell,
} from '@/components/common/Modal/TermsModals/TermsModalShell';

export function PassportModal({ onClose, onAgree }: TermsModalProps) {
  return (
    <TermsModalShell
      title="Consent to Processing of Unique Identifier"
      onClose={onClose}
      onAgree={onAgree}
    >
      <LegalSection title="1. Why This Consent Is Separate">
        <LegalParagraph>
          A passport number is a unique identifier under Article 24 of the
          Personal Information Protection Act of the Republic of Korea. The
          Company is required by law to obtain consent for its processing
          separately from consent to the processing of other personal data.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="2. Details of Processing">
        <LegalTable
          headers={['Item', 'Passport number']}
          rows={[
            ['Purpose', "Verification of the test taker's identity"],
            [
              'Retention',
              'Deleted immediately upon completion of verification (no later than 7 days after test submission)',
            ],
            ['Third-party provision', 'None'],
            ['Overseas transfer', 'None'],
            ['Processing consignment', 'None'],
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Security Measures">
        <LegalParagraph>
          ① The passport number is encrypted and stored separately from other
          personal data.
        </LegalParagraph>
        <LegalParagraph>
          ② Access is restricted to staff responsible for identity verification,
          and access logs are retained.
        </LegalParagraph>
        <LegalParagraph>
          ③ The full passport number is never displayed on the Service; it is
          masked (e.g. M1234****).
        </LegalParagraph>
        <LegalParagraph>
          ④ Once the retention period elapses, the passport number is
          permanently deleted by irrecoverable means.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Right to Refuse and Consequences">
        <LegalParagraph>
          ① You have the right to refuse this consent.
        </LegalParagraph>
        <LegalParagraph>
          ② The passport number is required to verify your identity as a test
          taker. If you refuse, you will not be able to take the Test.
        </LegalParagraph>
        <LegalParagraph>
          ③ You may withdraw consent at any time. Withdrawal may interrupt any
          test procedure in progress.
        </LegalParagraph>
      </LegalSection>
    </TermsModalShell>
  );
}
