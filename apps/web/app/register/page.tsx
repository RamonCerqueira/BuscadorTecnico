'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { apiPost } from '@/lib/api/client';
import { useSessionStore } from '@/lib/store';

// Auxiliary Components
import BrandingPanel from './components/BrandingPanel';
import StepIndicator from './components/StepIndicator';
import Step1Form from './components/Step1Form';
import Step2ClientForm from './components/Step2ClientForm';
import Step2TechForm from './components/Step2TechForm';
import Step3TechForm from './components/Step3TechForm';
import { UserType } from './components/RoleSelector';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useSessionStore((s) => s.setSession);
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>('client');
  const [direction, setDirection] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [certificates] = useState<string[]>([]); // Preserved placeholder for future upload state
  const [document, setDocument] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateStr, setStateStr] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const totalSteps = userType === 'client' ? 2 : 3;

  const registerMutation = useMutation({
    mutationFn: (cleanEmail: string) => {
      const payload = {
        name,
        email: cleanEmail,
        password,
        userType,
        acceptTerms,
        bio: userType === 'client' ? undefined : bio,
        specialties: userType === 'client' ? undefined : specialties,
        certificates: userType === 'client' ? undefined : certificates,
        document: userType === 'client' ? undefined : document,
        address: userType === 'client' ? undefined : address,
        city: userType === 'client' ? undefined : city,
        state: userType === 'client' ? undefined : stateStr,
        zipCode: userType === 'client' ? undefined : zipCode,
      };
      return apiPost<AuthResponse>('/auth/register', payload);
    },
    onSuccess: (data) => {
      try {
        const payload = JSON.parse(atob(data.accessToken.split('.')[1])) as { userType: string };
        setSession(data.accessToken, payload.userType as any);
        if (payload.userType === 'admin') {
          router.push('/admin');
        } else if (payload.userType === 'technician' || payload.userType === 'company') {
          router.push('/opportunities');
        } else {
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error decoding register token:', err);
        router.push('/login');
      }
    },
  });

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  const handleRegisterSubmit = () => {
    registerMutation.mutate(email.trim().toLowerCase());
  };

  const stepVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <main className="min-h-[calc(100vh-64px)] w-full flex flex-col lg:grid lg:grid-cols-2 bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Left Column: Premium Dynamic Branding widgets */}
      <BrandingPanel userType={userType} />

      {/* Right Column: Multi-step signup form */}
      <section className="w-full flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-20 bg-white dark:bg-[#0a0a0a]">
        <div className="w-full max-w-md space-y-8">
          <StepIndicator step={step} totalSteps={totalSteps} />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <Step1Form
                  userType={userType}
                  setUserType={(type) => {
                    setUserType(type);
                    setStep(1); // Reset step if user shifts between Client/Technician/Company
                  }}
                  name={name}
                  setName={setName}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  onNext={nextStep}
                />
              </motion.div>
            )}

            {step === 2 && userType === 'client' && (
              <motion.div
                key="step2-client"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <Step2ClientForm
                  acceptTerms={acceptTerms}
                  setAcceptTerms={setAcceptTerms}
                  isPending={registerMutation.isPending}
                  errorMsg={registerMutation.error ? registerMutation.error.message : null}
                  onBack={prevStep}
                  onSubmit={handleRegisterSubmit}
                />
              </motion.div>
            )}

            {step === 2 && userType !== 'client' && (
              <motion.div
                key="step2-tech"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <Step2TechForm
                  userType={userType}
                  document={document}
                  setDocument={setDocument}
                  zipCode={zipCode}
                  setZipCode={setZipCode}
                  address={address}
                  setAddress={setAddress}
                  city={city}
                  setCity={setCity}
                  stateStr={stateStr}
                  setStateStr={setStateStr}
                  bio={bio}
                  setBio={setBio}
                  specialties={specialties}
                  setSpecialties={setSpecialties}
                  onBack={prevStep}
                  onNext={nextStep}
                />
              </motion.div>
            )}

            {step === 3 && userType !== 'client' && (
              <motion.div
                key="step3-tech"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="space-y-6"
              >
                <Step3TechForm
                  acceptTerms={acceptTerms}
                  setAcceptTerms={setAcceptTerms}
                  isPending={registerMutation.isPending}
                  errorMsg={registerMutation.error ? registerMutation.error.message : null}
                  onBack={prevStep}
                  onSubmit={handleRegisterSubmit}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Já construiu seu império?{' '}
            <Link
              href="/login"
              className="text-indigo-500 hover:text-indigo-400 hover:underline transition-colors duration-200"
            >
              Acesse aqui.
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
