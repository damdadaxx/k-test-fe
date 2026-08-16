'use client';

import { useForm } from 'react-hook-form';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useSignIn } from '@/hooks/auth/useAuth';

import ButtonPrimary from '@/components/common/Button/ButtonPrimary';
import Input from '@/components/common/Form/Input';
import Label from '@/components/common/Form/Label';

type LoginFormValues = {
  email: string;
  password: string;
};

export function ModalLogin({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const signIn = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: 'onChange' });

  const onSubmit = (values: LoginFormValues) => {
    signIn.mutate(values, {
      onSuccess: () => {
        onClose();
        router.replace('/2/identity');
      },
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-black">Log In</h2>
        <p className="text-sm text-gray-500">Enter your email and password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Enter your Email',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Invalid email address',
              },
            })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Enter your password',
              minLength: {
                value: 8,
                message: 'Incorrect password',
              },
            })}
          />
        </div>

        {signIn.isError && (
          <p className="text-sm text-red-500">
            이메일 또는 비밀번호를 확인해주세요.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <ButtonPrimary type="submit" disabled={signIn.isPending}>
            Log In
          </ButtonPrimary>
          <div className="flex justify-center gap-3 text-sm">
            <span className="text-[#6B7280]">Don&apos;t have an account?</span>
            <Link href="/signup" className="font-bold text-black">
              Sign Up
            </Link>
          </div>
        </div>
      </form>
    </>
  );
}
