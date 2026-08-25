'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { getErrorMessage } from '@/lib/api/client';
import { NATIONALITY_OPTIONS } from '@/lib/constants/nationality';
import { signupSchema, type SignupFormValues } from '@/lib/schemas/signup';
import { cn } from '@/lib/utils/cn';

import { useModal } from '@/providers/ModalProvider';

import {
  useSendEmailCode,
  useSignUp,
  useVerifyEmailCode,
} from '@/hooks/auth/useAuth';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import DatePicker from '@/components/common/Form/DatePicker';
import Dropdown from '@/components/common/Form/Dropdown';
import FormRow from '@/components/common/Form/FormRow';
import Input from '@/components/common/Form/Input';
import Label from '@/components/common/Form/Label';
import TermCheckbox from '@/components/common/Form/TermCheckbox';
import {
  PassportModal,
  PrivacyModal,
  TosModal,
  VoiceDataModal,
} from '@/components/common/Modal/TermsModals';
import { PageHeader } from '@/components/common/PageHeader';

const EMAIL_CODE_TTL_SECONDS = 180;

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export default function SignupPage() {
  const router = useRouter();
  const signUp = useSignUp();
  const { openModal, closeModal } = useModal();

  const {
    register,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      nationality: '',
      birthDate: '',
      idType: 'PASSPORT',
      idNumber: '',
      companyCode: '',
      agreedToTerms: false,
      agreedToPrivacyPolicy: false,
      agreedToPassportProcessing: false,
      agreedToVoiceDataAiTraining: false,
    },
  });

  const sendEmailCode = useSendEmailCode();
  const verifyEmailCode = useVerifyEmailCode();

  const [emailSendState, setEmailSendState] = useState<'idle' | 'sent'>('idle');
  const [verifyState, setVerifyState] = useState<'idle' | 'error' | 'verified'>(
    'idle',
  );
  const [emailCode, setEmailCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sendCodeError, setSendCodeError] = useState<string | null>(null);

  const email = watch('email');

  useEffect(() => {
    setEmailSendState('idle');
    setVerifyState('idle');
    setEmailCode('');
    setSendCodeError(null);
  }, [email]);

  useEffect(() => {
    if (emailSendState !== 'sent' || verifyState === 'verified') return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [emailSendState, verifyState]);

  const handleSendEmailCode = () => {
    setSendCodeError(null);
    sendEmailCode.mutate(
      { email },
      {
        onSuccess: () => {
          setEmailSendState('sent');
          setVerifyState('idle');
          setEmailCode('');
          setSecondsLeft(EMAIL_CODE_TTL_SECONDS);
        },
        onError: (error) => {
          setSendCodeError(
            getErrorMessage(error, 'Failed to send the code. Try again.'),
          );
        },
      },
    );
  };

  const handleVerifyEmailCode = () => {
    verifyEmailCode.mutate(
      { email, code: emailCode },
      {
        onSuccess: () => {
          setVerifyState('verified');
          clearErrors('email');
        },
        onError: () => setVerifyState('error'),
      },
    );
  };

  const handleOpenTosModal = () => {
    openModal(
      <TosModal
        onClose={closeModal}
        onAgree={() => {
          setValue('agreedToTerms', true, { shouldValidate: true });
          closeModal();
        }}
      />,
    );
  };

  const handleOpenPrivacyModal = () => {
    openModal(
      <PrivacyModal
        onClose={closeModal}
        onAgree={() => {
          setValue('agreedToPrivacyPolicy', true, { shouldValidate: true });
          closeModal();
        }}
      />,
    );
  };

  const handleOpenPassportModal = () => {
    openModal(
      <PassportModal
        onClose={closeModal}
        onAgree={() => {
          setValue('agreedToPassportProcessing', true, {
            shouldValidate: true,
          });
          closeModal();
        }}
      />,
    );
  };

  const handleOpenVoiceDataModal = () => {
    openModal(
      <VoiceDataModal
        onClose={closeModal}
        onAgree={() => {
          setValue('agreedToVoiceDataAiTraining', true, {
            shouldValidate: true,
          });
          closeModal();
        }}
      />,
    );
  };

  const agreedToTerms = watch('agreedToTerms');
  const agreedToPrivacyPolicy = watch('agreedToPrivacyPolicy');
  const agreedToPassportProcessing = watch('agreedToPassportProcessing');
  const agreedToVoiceDataAiTraining = watch('agreedToVoiceDataAiTraining');

  const allAgreed = Boolean(
    agreedToTerms &&
    agreedToPrivacyPolicy &&
    agreedToPassportProcessing &&
    agreedToVoiceDataAiTraining,
  );

  const handleAgreeAll = (checked: boolean) => {
    setValue('agreedToTerms', checked, { shouldValidate: true });
    setValue('agreedToPrivacyPolicy', checked, { shouldValidate: true });
    setValue('agreedToPassportProcessing', checked, { shouldValidate: true });
    setValue('agreedToVoiceDataAiTraining', checked, { shouldValidate: true });
  };

  const termsError =
    errors.agreedToTerms?.message ||
    errors.agreedToPrivacyPolicy?.message ||
    errors.agreedToPassportProcessing?.message;

  const onSubmit = (data: SignupFormValues) => {
    if (verifyState !== 'verified') {
      setError('email', {
        message: 'Please verify your email before continuing.',
      });
      return;
    }
    signUp.mutate(
      { ...data, companyCode: data.companyCode || undefined },
      // 가입 완료 후엔 랜딩으로. 응시는 랜딩의 "Take Test"로만 시작.
      { onSuccess: () => router.replace('/') },
    );
  };

  return (
    <main>
      <PageHeader variant="public" />

      <section className="flex min-h-screen flex-col items-center bg-page-bg pt-20">
        <div className="flex w-full max-w-190 flex-col items-center pt-12.5 pb-20">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex w-full flex-col gap-8 rounded-2xl bg-white p-10"
          >
            <section className="flex w-full flex-col">
              <h2 className="w-full pb-4 text-title-md text-icon-90">
                Sign Up
              </h2>

              <div className="flex w-full flex-col">
                <div className="flex w-full items-start gap-5 py-3">
                  <Label
                    htmlFor="email"
                    type="required"
                    className="h-11.5 w-25 shrink-0 items-center text-icon-90"
                  >
                    Email
                  </Label>

                  <div className="flex flex-1 items-start gap-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <div
                        className={cn(
                          'flex h-11.5 w-full items-center gap-1 rounded-8 border bg-white py-(--space-12) pr-(--space-8) pl-(--space-16)',
                          errors.email ? 'border-error' : 'border-neutral-30',
                        )}
                      >
                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder="name@example.com"
                          readOnly={emailSendState === 'sent'}
                          className="min-w-0 flex-1 bg-transparent text-sm text-icon-90 placeholder-icon-30 outline-none"
                          {...register('email')}
                        />
                        {emailSendState === 'sent' &&
                          verifyState !== 'verified' && (
                            <span className="shrink-0 text-sm text-icon-30">
                              {formatCountdown(secondsLeft)}
                            </span>
                          )}
                      </div>
                      {errors.email && (
                        <p className="ml-4 text-sm text-error">
                          {errors.email.message}
                        </p>
                      )}

                      {emailSendState === 'sent' && (
                        <div className="flex w-full flex-col gap-2">
                          <div
                            className={cn(
                              'flex h-11.5 w-full items-center gap-1 rounded-8 border bg-white py-(--space-12) pr-(--space-8) pl-(--space-16)',
                              verifyState === 'error'
                                ? 'border-error'
                                : 'border-neutral-30',
                            )}
                          >
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="6-digit code"
                              value={emailCode}
                              onChange={(e) => {
                                setEmailCode(e.target.value);
                                setVerifyState('idle');
                              }}
                              disabled={verifyState === 'verified'}
                              className="min-w-0 flex-1 bg-transparent text-sm text-icon-90 placeholder-icon-30 outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyEmailCode}
                              disabled={
                                !emailCode ||
                                verifyState === 'verified' ||
                                verifyEmailCode.isPending
                              }
                              className={cn(
                                'shrink-0 cursor-pointer rounded-8 bg-primary p-2 text-sm text-white disabled:opacity-50',
                                'disabled:cursor-default',
                              )}
                            >
                              Verify
                            </button>
                          </div>
                          {verifyState === 'error' && (
                            <p className="text-sm text-error">
                              That code isn&apos;t correct. Check your email and
                              try again
                            </p>
                          )}
                          {verifyState === 'verified' && (
                            <p className="text-sm text-green-600">Verified</p>
                          )}
                        </div>
                      )}
                      {sendCodeError && (
                        <p className="text-sm text-error">{sendCodeError}</p>
                      )}
                    </div>

                    {verifyState !== 'verified' && (
                      <ButtonPrimary
                        as="button"
                        type="button"
                        variant={emailSendState === 'idle' ? 'fill' : 'line'}
                        size="sm"
                        width={79}
                        onClick={handleSendEmailCode}
                        disabled={
                          !email || !!errors.email || sendEmailCode.isPending
                        }
                      >
                        {emailSendState === 'idle' ? 'Send' : 'Resend'}
                      </ButtonPrimary>
                    )}
                  </div>
                </div>

                <FormRow label="Password" htmlFor="password">
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register('password')}
                  />
                </FormRow>

                <div className="flex w-full gap-10">
                  <div className="min-w-0 flex-1">
                    <FormRow label="First Name" htmlFor="firstName">
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="GILDONG"
                        error={errors.firstName?.message}
                        {...register('firstName')}
                      />
                    </FormRow>
                  </div>
                  <div className="min-w-0 flex-1">
                    <FormRow label="Last Name" htmlFor="lastName">
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="HONG"
                        error={errors.lastName?.message}
                        {...register('lastName')}
                      />
                    </FormRow>
                  </div>
                </div>

                <FormRow label="Date of Birth" htmlFor="birthDate">
                  <div className="flex w-full flex-col gap-2">
                    <Controller
                      name="birthDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          id="birthDate"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.birthDate && (
                      <p className="ml-4 text-sm text-error">
                        {errors.birthDate.message}
                      </p>
                    )}
                  </div>
                </FormRow>

                <FormRow label="Nationality" htmlFor="nationality">
                  <div className="flex w-full flex-col gap-2">
                    <Controller
                      name="nationality"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          id="nationality"
                          options={NATIONALITY_OPTIONS}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errors.nationality && (
                      <p className="ml-4 text-sm text-error">
                        {errors.nationality.message}
                      </p>
                    )}
                  </div>
                </FormRow>

                <FormRow label="Passport Number" htmlFor="idNumber">
                  <Input
                    id="idNumber"
                    type="text"
                    placeholder="Passport number"
                    error={errors.idNumber?.message}
                    {...register('idNumber')}
                  />
                </FormRow>
              </div>
            </section>

            <section className="flex w-full flex-col">
              <h2 className="w-full pb-4 text-base font-bold text-icon-90">
                Terms of Service Agreement
              </h2>

              <div
                className={cn(
                  'flex w-full flex-col gap-4 rounded-md border p-5',
                  termsError ? 'border-error' : 'border-neutral-30',
                )}
              >
                <TermCheckbox
                  label="Agree to all"
                  caption="Includes all required and optional items."
                  bold
                  checked={allAgreed}
                  onChange={handleAgreeAll}
                />

                <div className="h-px w-full bg-neutral-30" />

                <Controller
                  name="agreedToTerms"
                  control={control}
                  render={({ field }) => (
                    <TermCheckbox
                      label="[Required]  I am 18 or older and agree to the Terms of Service"
                      showChevron
                      checked={field.value}
                      onChange={field.onChange}
                      onOpenDetail={handleOpenTosModal}
                    />
                  )}
                />
                <Controller
                  name="agreedToPrivacyPolicy"
                  control={control}
                  render={({ field }) => (
                    <TermCheckbox
                      label="[Required]  Collection, use, and overseas transfer of personal data"
                      showChevron
                      checked={field.value}
                      onChange={field.onChange}
                      onOpenDetail={handleOpenPrivacyModal}
                    />
                  )}
                />
                <Controller
                  name="agreedToPassportProcessing"
                  control={control}
                  render={({ field }) => (
                    <TermCheckbox
                      label="[Required]  Processing of passport number"
                      showChevron
                      checked={field.value}
                      onChange={field.onChange}
                      onOpenDetail={handleOpenPassportModal}
                    />
                  )}
                />

                <div className="h-px w-full bg-neutral-30" />

                <Controller
                  name="agreedToVoiceDataAiTraining"
                  control={control}
                  render={({ field }) => (
                    <TermCheckbox
                      label="[Optional]  Use of voice data for AI model training"
                      caption="Declining does not affect your test or score"
                      showChevron
                      checked={field.value ?? false}
                      onChange={field.onChange}
                      onOpenDetail={handleOpenVoiceDataModal}
                    />
                  )}
                />
              </div>
              {termsError && (
                <p className="mt-2 ml-4 text-sm text-error">
                  Please agree to all required terms.
                </p>
              )}
            </section>

            {signUp.isError && (
              <p className="text-sm text-error">
                {getErrorMessage(
                  signUp.error,
                  'Sign up failed. Please check your input.',
                )}
              </p>
            )}

            <div className="flex w-full items-start justify-center pt-5">
              <ButtonPrimary
                type="submit"
                disabled={signUp.isPending}
                width={122}
              >
                Register
              </ButtonPrimary>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
