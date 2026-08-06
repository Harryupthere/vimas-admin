import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.scss';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, rows = 4, ...rest }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className={styles.field}>
        {label && (
          <label htmlFor={textareaId} className={styles.label}>
            {label}
            {rest.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={[styles.textarea, error ? styles.hasError : '', className || ''].filter(Boolean).join(' ')}
          aria-invalid={!!error}
          {...rest}
        />
        {error ? (
          <span className={styles.errorText}>{error}</span>
        ) : hint ? (
          <span className={styles.hintText}>{hint}</span>
        ) : null}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
