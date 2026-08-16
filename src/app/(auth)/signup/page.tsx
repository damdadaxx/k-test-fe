'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import type { SignUpRequest } from '@/lib/api/auth';
import { cn } from '@/lib/utils/cn';

import { useCheckEmail, useSignUp } from '@/hooks/auth/useAuth';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import FormRow from '@/components/common/Form/FormRow';
import Input from '@/components/common/Form/Input';
import Label from '@/components/common/Form/Label';
import TermCheckbox from '@/components/common/Form/TermCheckbox';
import Header from '@/components/landing/Header';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
  const signUp = useSignUp();
  const checkEmail = useCheckEmail();

  const [form, setForm] = useState<SignUpRequest>({
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
  });
  const [emailChecked, setEmailChecked] = useState(false);

  // TODO: 아이디/전화번호/문자서비스·사업자등록 약관은 SignUpRequest API에 아직 없음.
  // 백엔드에 필드 추가되면 SignUpRequest에 옮기고 이 로컬 상태는 지울 것.
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [agreedSmsTerms, setAgreedSmsTerms] = useState(false);
  const [agreedBusinessInfo, setAgreedBusinessInfo] = useState(false);

  const updateField = <K extends keyof SignUpRequest>(
    key: K,
    value: SignUpRequest[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === 'email') setEmailChecked(false);
  };

  const handleCheckEmail = () => {
    checkEmail.mutate(form.email, {
      onSuccess: (res) => setEmailChecked(res.available),
    });
  };

  const allAgreed =
    form.agreedToTerms &&
    agreedSmsTerms &&
    agreedBusinessInfo &&
    form.agreedToPrivacyPolicy;
  const handleAgreeAll = (checked: boolean) => {
    updateField('agreedToTerms', checked);
    setAgreedSmsTerms(checked);
    setAgreedBusinessInfo(checked);
    updateField('agreedToPrivacyPolicy', checked);
  };

  const canSubmit =
    emailChecked &&
    form.password &&
    username &&
    phone &&
    // TODO: 영문 이름/성/국적/생년월일/신분증 — 디자인엔 없지만 API 필수값이라
    // 상태는 유지. 본인인증 플로우 연결되면 다시 노출.
    form.firstName &&
    form.lastName &&
    form.nationality &&
    form.birthDate &&
    form.idNumber &&
    form.agreedToTerms &&
    agreedSmsTerms &&
    agreedBusinessInfo;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    signUp.mutate(
      { ...form, companyCode: form.companyCode || undefined },
      { onSuccess: () => router.push('/exams') },
    );
  };

  return (
    <main>
      <Header />

      <section className="flex min-h-screen flex-col items-center bg-page-bg">
        <div className="flex w-full max-w-190 flex-col items-center gap-6 pt-12.5 pb-20">
          <h1 className="w-full pl-[20px] text-title-lg text-icon-90">
            개인 회원가입
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col gap-8 rounded-2xl bg-white p-10 shadow-sm"
          >
            <section className="flex w-full flex-col">
              <h2 className="w-full pb-4 text-title-md text-icon-90">
                기본정보
              </h2>

              <div className="flex w-full flex-col">
                <div className="flex items-start w-full gap-5 py-3">
                  <Label
                    type="required"
                    className="w-25 shrink-0c text-icon-90"
                  >
                    본인 인증
                  </Label>
                  <div className="flex flex-1 flex-col items-start gap-2">
                    <label className="flex items-center gap-2 py-1">
                      <span className="flex size-6 items-center justify-center rounded-full border-2 border-icon-90">
                        <span className="size-3 rounded-full bg-icon-90" />
                      </span>
                      <span className="text-base text-icon-90">본인인증</span>
                    </label>
                    <p className="text-sm text-icon-30">
                      본인명의로 개설된 휴대폰 또는 공동인증서로 인증할 수
                      있습니다.
                    </p>
                    {/* TODO: 실제 본인인증 플로우 연결 전까지는 no-op */}
                    <ButtonPrimary variant="line" size="sm" width={96}>
                      인증하기
                    </ButtonPrimary>
                  </div>
                </div>

                <FormRow label="아이디" htmlFor="username">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="아이디를 입력하세요"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </FormRow>

                <FormRow label="비밀번호" htmlFor="password">
                  <Input
                    id="password"
                    name="new-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="비밀번호를 입력하세요"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                  />
                </FormRow>

                <FormRow label="전화번호" htmlFor="phone">
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="전화번호를 입력하세요"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </FormRow>

                <FormRow label="이메일" htmlFor="email">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCheckEmail}
                    disabled={!form.email || checkEmail.isPending}
                  >
                    중복확인
                  </Button>
                </FormRow>
                {checkEmail.isSuccess && (
                  <p
                    className={cn(
                      'text-sm pl-30',
                      checkEmail.data.available
                        ? 'text-green-600'
                        : 'text-error',
                    )}
                  >
                    {checkEmail.data.available
                      ? '사용 가능한 이메일입니다.'
                      : '이미 사용 중인 이메일입니다.'}
                  </p>
                )}

                {/* 디자인(node 40000060:3349)에 없는 항목 — 실제 API 필수값이라 상태는 유지, 노출만 보류 */}
                {/* <FormRow label="영문 이름" htmlFor="firstName">
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="GILDONG"
                    value={form.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                  />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="HONG"
                    value={form.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                  />
                </FormRow>

                <FormRow label="국적" htmlFor="nationality">
                  <Input
                    id="nationality"
                    type="text"
                    placeholder="KOR"
                    value={form.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                  />
                </FormRow>

                <FormRow label="생년월일" htmlFor="birthDate">
                  <Input
                    id="birthDate"
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                  />
                </FormRow>

                <FormRow label="신분증" htmlFor="idNumber">
                  <select
                    value={form.idType}
                    onChange={(e) =>
                      updateField('idType', e.target.value as IdType)
                    }
                    className="rounded-8 bg-neutral-20 p-(--space-16) text-sm text-icon-90 outline-none"
                  >
                    <option value="PASSPORT">여권</option>
                    <option value="ARC">외국인등록증</option>
                  </select>
                  <Input
                    id="idNumber"
                    type="text"
                    placeholder="신분증 번호"
                    value={form.idNumber}
                    onChange={(e) => updateField('idNumber', e.target.value)}
                  />
                </FormRow>

                <FormRow label="소속 기업" htmlFor="companyCode">
                  <Input
                    id="companyCode"
                    type="text"
                    placeholder="기업 코드 (선택)"
                    value={form.companyCode}
                    onChange={(e) => updateField('companyCode', e.target.value)}
                  />
                </FormRow> */}
              </div>
            </section>

            <section className="flex w-full flex-col">
              <h2 className="flex w-full items-start gap-1 pb-4 text-base font-bold text-icon-90">
                약관 동의
                <span className="text-[#ff5c00]">*</span>
              </h2>

              <div className="flex w-full flex-col gap-4 rounded-md border border-neutral-30 p-5">
                <div className="flex flex-col gap-1">
                  <TermCheckbox
                    label="전체동의"
                    checked={allAgreed}
                    onChange={handleAgreeAll}
                  />
                  <p className="pl-7 text-sm text-icon-30">
                    선택항목 포함 모든 약관에 동의합니다.
                  </p>
                </div>

                <div className="h-px w-full bg-neutral-30" />
                <TermCheckbox
                  label="(필수) 서비스 이용약관동의"
                  checked={form.agreedToTerms}
                  onChange={(checked) => updateField('agreedToTerms', checked)}
                />
                <TermCheckbox
                  label="(필수) 문자서비스 이용약관 동의"
                  checked={agreedSmsTerms}
                  onChange={setAgreedSmsTerms}
                />
                <TermCheckbox
                  label="(필수) 사업자등록정보 수집 및 이용 동의"
                  checked={agreedBusinessInfo}
                  onChange={setAgreedBusinessInfo}
                />
                <div className="flex flex-col gap-1">
                  <TermCheckbox
                    label="(선택) 개인정보수집 및 이용 동의"
                    checked={form.agreedToPrivacyPolicy}
                    onChange={(checked) =>
                      updateField('agreedToPrivacyPolicy', checked)
                    }
                  />
                  <p className="pl-7 text-sm text-icon-30">
                    어떤 개인정보로 활용할수 있을까
                  </p>
                </div>
              </div>
            </section>

            {signUp.isError && (
              <p className="text-sm text-error">
                가입에 실패했습니다. 입력값을 확인해주세요.
              </p>
            )}

            <div className="flex w-full items-start justify-center pt-5">
              <ButtonPrimary
                type="submit"
                disabled={!canSubmit || signUp.isPending}
                width={122}
              >
                가입하기
              </ButtonPrimary>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
