'use client';

import styles from './Stepper.module.css';

type StepperProps = {
  current: number;
  total?: number;
};

export function Stepper({
  current,
  total = 3,
}: StepperProps) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className={styles.stepper}>
      {steps.map((step) => {
        const activeOrDone = step <= current;

        return (
          <div
            key={step}
            className={`${styles.circle} ${
              activeOrDone ? styles.circleActive : styles.circleInactive
            }`}
          >
            <span
              className={`${styles.text} ${
                activeOrDone ? styles.textActive : styles.textInactive
              }`}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}