'use client';

import styles from './Button.module.css';

const VARIANT_CLASS = {
  primary: styles.primary,
  secondary: styles.secondary,
  outline: styles.outline,
  tinted: styles.tinted,
  'warning-outline': styles.warningOutline,
  danger: styles.danger,
  'danger-outline': styles.dangerOutline,
};

export default function Button({
  variant = 'primary',
  size = 'base',
  type = 'button',
  icon: Icon,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    styles.btn,
    VARIANT_CLASS[variant],
    size === 'sm' ? styles.sm : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {Icon && <Icon className={styles.icon} aria-hidden="true" />}
      {children}
    </button>
  );
}
