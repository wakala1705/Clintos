'use client';

import styles from './Badge.module.css';

const TONE_CLASS = {
  neutral: styles.neutral,
  danger: styles.danger,
  warn: styles.warn,
  success: styles.success,
  info: styles.info,
};

const DOT_CLASS = {
  neutral: styles.neutralDot,
  danger: styles.dangerDot,
  warn: styles.warnDot,
  success: styles.successDot,
  info: styles.infoDot,
};

export default function Badge({
  tone = 'neutral',
  dot = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [styles.badge, TONE_CLASS[tone], className].filter(Boolean).join(' ');

  return (
    <span className={classes} {...rest}>
      {dot && <span className={[styles.dot, DOT_CLASS[tone]].join(' ')} aria-hidden="true" />}
      {children}
    </span>
  );
}
