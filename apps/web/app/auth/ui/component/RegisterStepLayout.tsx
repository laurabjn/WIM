import { ReactNode } from 'react';
import { Stepper } from './Stepper';

type Props = {
  step?: number;
  title: string;
  children: ReactNode;
  onBack?: () => void;
  footer?: ReactNode;
  showStepper?: boolean;
};

export function RegisterStepLayout({
  step,
  title,
  children,
  onBack,
  footer,
  showStepper = true,
}: Props) {
  return (
    <>
      <div>
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center"
          >
            ←
          </button>

          <h1 className="text-sm font-semibold text-black">
            Créer un compte Wim
          </h1>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {showStepper && step ? <Stepper current={step} /> : null}
          <h2 className="text-3xl font-bold text-center mb-5">{title}</h2>
          {children}
        </div>
      </div>

      {footer}
    </>
  );
}