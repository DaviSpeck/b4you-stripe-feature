import { useMemo } from 'react';
import { FileText } from 'react-feather';
import { type FormStatusHeaderProps } from '../../interfaces/formseditor.interface';

export const FormStatusHeader = ({
  form,
  isMobile,
  isDark,
}: FormStatusHeaderProps) => {
  const status = useMemo(() => {
    if (!form) {
      return {
        label: 'Inativo',
        color: '#ef4444',
        glow: '0 0 8px rgba(239, 68, 68, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
      };
    }
    return form.is_active
      ? {
          label: 'Ativo',
          color: '#10b981',
          glow: '0 0 8px rgba(16, 185, 129, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
        }
      : {
          label: 'Inativo',
          color: '#ef4444',
          glow: '0 0 8px rgba(239, 68, 68, 0.6), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
        };
  }, [form]);

  if (!form) return null;

  const answersCount = form.answers_count ?? 0;

  return (
    <div
      className="d-flex flex-column flex-sm-row align-items-center gap-2 justify-content-center"
      style={{
        paddingTop: isMobile ? '1rem' : '2rem',
        paddingBottom: isMobile ? '1rem' : '2rem',
      }}
    >
      <h5
        style={{
          margin: 0,
          fontWeight: 600,
          fontSize: isMobile ? '1.1rem' : '1.25rem',
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
      >
        {form.title}
      </h5>
      <div className="d-flex align-items-center" style={{ gap: 8 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            backgroundColor: status.color,
            boxShadow: status.glow,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            filter: 'brightness(0.9) saturate(0.8)',
          }}
        />
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: status.color,
            whiteSpace: 'nowrap',
          }}
        >
          {status.label}
        </span>
      </div>
      {answersCount > 0 && (
        <div
          className="d-flex align-items-center"
          style={{
            gap: 6,
            padding: '4px 10px',
            borderRadius: 12,
            backgroundColor: isDark
              ? 'rgba(59, 130, 246, 0.15)'
              : 'rgba(59, 130, 246, 0.1)',
            border: `1px solid ${
              isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'
            }`,
          }}
          title={`Este formulário possui ${answersCount} resposta(s) registrada(s)`}
        >
          <FileText size={14} style={{ color: '#3b82f6', flexShrink: 0 }} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#3b82f6',
              whiteSpace: 'nowrap',
            }}
          >
            {answersCount}{' '}
            {answersCount === 1
              ? 'resposta registrada'
              : 'respostas registradas'}
          </span>
        </div>
      )}
    </div>
  );
};

export default FormStatusHeader;
