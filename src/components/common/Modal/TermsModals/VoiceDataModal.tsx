'use client';

import { LegalParagraph } from '@/components/common/Modal/TermsModals/LegalParagraph';
import { LegalSection } from '@/components/common/Modal/TermsModals/LegalSection';
import { LegalTable } from '@/components/common/Modal/TermsModals/LegalTable';
import {
  TermsModalProps,
  TermsModalShell,
} from '@/components/common/Modal/TermsModals/TermsModalShell';

export function VoiceDataModal({ onClose, onAgree }: TermsModalProps) {
  return (
    <TermsModalShell
      title="Consent to Use of Voice Data for AI Model Training"
      onClose={onClose}
      onAgree={onAgree}
    >
      <p className="w-full text-sm text-[#8f8f8f]">Effective June 17, 2026</p>

      <LegalSection title="1. How This Differs from What You Already Agreed To">
        <LegalParagraph>
          Your submitted voice recordings are already used for scoring and
          quality review, as covered under the required Consent to Collection
          and Use of Personal Data.
        </LegalParagraph>
        <LegalParagraph>
          This consent is a separate request to use those recordings beyond that
          scope, to improve the performance of the Company&apos;s scoring AI
          model.
        </LegalParagraph>
        <LegalTable
          headers={['', 'Purpose', 'Status']}
          rows={[
            [
              'Existing (Required)',
              'Scoring and result calculation for your own test',
              'Already agreed',
            ],
            [
              'This consent (Optional)',
              'Training and improving the scoring AI model',
              'Additional request',
            ],
          ]}
        />
      </LegalSection>

      <LegalSection title="2. Details of Processing">
        <LegalTable
          headers={['Item', 'Voice recordings submitted during the Test']}
          rows={[
            [
              'Purpose',
              'Improving accuracy of Korean pronunciation and intonation recognition; scoring model training',
            ],
            [
              'Method',
              'Used only after removing identifying information such as name, email, and passport number',
            ],
            ['Retention', 'Until consent is withdrawn'],
            ['Third-party provision', 'None'],
          ]}
        />
      </LegalSection>

      <LegalSection title="3. What We Do Not Use It For">
        <LegalParagraph>
          The Company does not use voice data collected under this consent for
          any of the following:
        </LegalParagraph>
        <div className="w-full text-base text-[#333]">
          <p>• Advertising or marketing</p>
          <p>• Sale or provision to third parties</p>
          <p>• Identifying or tracking individual Members</p>
          <p>• Influencing a Member&apos;s own score</p>
        </div>
        <LegalParagraph>
          Your decision on this consent has no effect whatsoever on your scoring
          results.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="4. Right to Refuse and Consequences">
        <LegalParagraph>
          ① You have the right to refuse this consent.
        </LegalParagraph>
        <LegalParagraph>
          ② Refusing imposes no restriction whatsoever on taking the Test,
          scoring, or receiving results.
        </LegalParagraph>
        <LegalParagraph>
          ③ This consent is not a condition of using the Service.
        </LegalParagraph>
      </LegalSection>

      <LegalSection title="5. Withdrawal of Consent">
        <LegalParagraph>
          ① You may withdraw this consent at any time in your account settings.
        </LegalParagraph>
        <LegalParagraph>
          ② Upon withdrawal, the Company immediately removes your voice data
          from the training dataset and deletes it.
        </LegalParagraph>
        <LegalParagraph>
          ③ However, it is technically impossible to remove the contribution of
          that data from models already trained before withdrawal. The Company
          discloses this in advance, and you acknowledge it in giving this
          consent.
        </LegalParagraph>
      </LegalSection>
    </TermsModalShell>
  );
}
