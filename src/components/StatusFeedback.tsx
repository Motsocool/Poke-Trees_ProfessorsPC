/**
 * Status message component for displaying operation feedback
 */

import { useState, useEffect } from 'react';
import type { ValidationResult } from '../lib/validation/SaveValidator';

export interface StatusMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string[];
}

interface StatusFeedbackProps {
  message: StatusMessage | null;
  onClear?: () => void;
  autoHideDelay?: number;
}

export function StatusFeedback({ message, onClear, autoHideDelay = 5000 }: StatusFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      if (autoHideDelay > 0 && message.type !== 'error') {
        const timer = setTimeout(() => {
          setVisible(false);
          if (onClear) onClear();
        }, autoHideDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [message, autoHideDelay, onClear]);

  if (!message || !visible) return null;

  const bgColor = {
    success: '#4ade80',
    error: '#f87171',
    warning: '#fbbf24',
    info: '#60a5fa',
  }[message.type];

  const icon = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  }[message.type];

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: bgColor,
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        zIndex: 1000,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{message.message}</div>
          {message.details && message.details.length > 0 && (
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
              {message.details.map((detail, i) => (
                <li key={i}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
        {onClear && (
          <button
            onClick={() => {
              setVisible(false);
              onClear();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0',
              opacity: 0.7,
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Convert ValidationResult to StatusMessage
 */
export function validationResultToStatus(result: ValidationResult): StatusMessage {
  if (result.errors.length > 0) {
    return {
      type: 'error',
      message: 'Validation failed',
      details: result.errors.map(e => `${e.location ? e.location + ': ' : ''}${e.message}`),
    };
  }
  
  if (result.warnings.length > 0) {
    return {
      type: 'warning',
      message: 'Validation completed with warnings',
      details: result.warnings.map(w => `${w.location ? w.location + ': ' : ''}${w.message}`),
    };
  }
  
  return {
    type: 'success',
    message: 'Validation successful',
    details: result.info.map(i => i.message),
  };
}
