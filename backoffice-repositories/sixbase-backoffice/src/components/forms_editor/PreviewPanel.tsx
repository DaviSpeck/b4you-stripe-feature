import { useMemo } from 'react';
import { type PreviewPanelProps } from '../../interfaces/formseditor.interface';
import { type Question } from '../../hooks/useFormEditor';

const mapOptions = (options: Question['options']) => {
  const raw = Array.isArray(options) ? options : Object.values(options || {});
  return raw.map((option) =>
    typeof option === 'object' && option !== null
      ? {
          value: String(option.value ?? option.key ?? option.id ?? ''),
          label: String(
            option.label ?? option.value ?? option.key ?? option.id ?? '',
          ),
        }
      : {
          value: String(option),
          label: String(option),
        },
  );
};

export const PreviewPanel = ({
  questions,
  previewStep,
  setPreviewStep,
  isMobile,
}: PreviewPanelProps) => {
  const { orders, steps } = useMemo(() => {
    const sorted = [...questions].sort((a, b) => a.order - b.order);
    const grouped = new Map<number, Question[]>();
    sorted.forEach((question) => {
      const key = Number.isFinite(question.order) ? question.order : 0;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(question);
    });
    const orderKeys = Array.from(grouped.keys()).sort((a, b) => a - b);
    return {
      orders: orderKeys,
      steps: orderKeys.map((key) => grouped.get(key) || []),
    };
  }, [questions]);

  const currentGroup = steps[previewStep - 1] || [];

  return (
    <div
      style={{
        background: '#fff',
        padding: isMobile ? '1rem' : '1.875rem',
        borderRadius: 8,
      }}
    >
      <div
        className="d-flex align-items-center mb-3 steps-scroll-container"
        style={{
          gap: 8,
          overflowX: 'auto',
          overflowY: 'hidden',
          flexWrap: 'nowrap',
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {orders.map((order, index) => (
          <button
            key={order}
            type="button"
            className={`btn btn-sm btn-${
              index + 1 === previewStep ? 'primary' : 'light'
            }`}
            onClick={() => setPreviewStep(index + 1)}
            style={{ flexShrink: 0 }}
          >
            Etapa {index + 1}
          </button>
        ))}
      </div>

      {currentGroup.map((question) => {
        const placeholder = question.help_text || question.placeholder || '';
        const inputStyle: React.CSSProperties = {
          width: '100%',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: 4,
          fontSize: 14,
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          color: '#0f1b35',
        };

        return (
          <div
            key={question.id}
            style={{
              marginBottom: question.type === 'textarea' ? 24 : 16,
            }}
          >
            <label
              style={{
                display: 'block',
                marginBottom: 8,
                fontWeight: 500,
                color: '#0f1b35',
              }}
            >
              {question.label}{' '}
              {question.required && <span style={{ color: 'red' }}>*</span>}
            </label>
            {question.type === 'text' && (
              <input
                type="text"
                placeholder={placeholder}
                style={inputStyle}
                disabled
              />
            )}
            {question.type === 'textarea' && (
              <textarea
                placeholder={placeholder}
                rows={8}
                style={{
                  ...inputStyle,
                  minHeight: 180,
                  height: 180,
                  resize: 'vertical',
                  lineHeight: 1.6,
                  padding: 12,
                  overflowY: 'auto',
                }}
                disabled
              />
            )}
            {question.type === 'number' && (
              <input
                type="number"
                placeholder={placeholder}
                style={inputStyle}
                disabled
              />
            )}
            {question.type === 'date' && (
              <input
                type="date"
                placeholder={placeholder}
                style={inputStyle}
                disabled
              />
            )}
            {question.type === 'boolean' && (
              <select style={inputStyle} disabled>
                <option value="">Selecione...</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            )}
            {question.type === 'select' && (
              <div>
                {mapOptions(question.options).map(({ value, label }) => (
                  <label
                    key={value}
                    style={{
                      display: 'block',
                      marginBottom: 6,
                      cursor: 'default',
                      color: '#0f1b35',
                    }}
                  >
                    <input
                      type="radio"
                      name={`${question.key}-preview`}
                      value={value}
                      style={{ marginRight: 6 }}
                      disabled
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
            {question.type === 'multiselect' && (
              <div>
                {mapOptions(question.options).map(({ value, label }) => (
                  <label
                    key={value}
                    style={{
                      display: 'block',
                      marginBottom: 6,
                      cursor: 'default',
                      color: '#0f1b35',
                    }}
                  >
                    <input
                      type="checkbox"
                      value={value}
                      style={{ marginRight: 6 }}
                      disabled
                    />
                    {label}
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PreviewPanel;
