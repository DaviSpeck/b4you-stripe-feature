import React from 'react';
import { getActiveForm } from '../../services/forms';

export default function DynamicOnboardingForm({
  initialType = 2,
  onReady,
  onChange,
  onMetaChange,
}) {
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState(null);
  const [values, setValues] = React.useState({});
  const [error, setError] = React.useState('');
  const [current, setCurrent] = React.useState(0);

  const isVisible = React.useCallback((q, vals) => {
    if (!q.visible_if) return true;

    return Object.entries(q.visible_if).every(([key, expected]) => {
      const v = vals[key];

      if (Array.isArray(expected)) return expected.includes(v);
      if (Array.isArray(v)) return v.includes(expected);

      return v === expected;
    });
  }, []);

  const isEmptyValue = (q, v) => {
    const val = v[q.key];

    if (q.type === 'multiselect') return !Array.isArray(val) || val.length === 0;
    if (q.type === 'select') return val === undefined || val === null || val === '';
    return val === undefined || val === null || String(val).trim() === '';
  };

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');

      try {
        const data = await getActiveForm(initialType);

        setForm(data);
        setValues({});
        setCurrent(0);

        if (onReady && data?.id) onReady({ id_form: data.id });
      } catch (e) {
        setError('Não foi possível carregar o formulário.');
      } finally {
        setLoading(false);
      }
    })();
  }, [initialType]);

  const handleChange = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  React.useEffect(() => {
    onChange?.(values);
  }, [values]);

  const groups = React.useMemo(() => {
    if (!form?.questions) return [];

    const list = form.questions.filter((q) => q.is_active !== false);
    list.sort((a, b) => a.order - b.order);

    const by = new Map();
    list.forEach((q) => {
      const k = Number.isFinite(q.order) ? q.order : 0;
      if (!by.has(k)) by.set(k, []);
      by.get(k).push(q);
    });

    return Array.from(by.keys())
      .sort((a, b) => a - b)
      .map((ord) => ({ order: ord, questions: by.get(ord) }));
  }, [form]);

  const totalSteps = groups.length;

  const currentGroup = React.useMemo(() => {
    return groups[current] || { questions: [] };
  }, [groups, current]);

  const visibleQuestions = React.useMemo(() => {
    return currentGroup.questions.filter((q) => isVisible(q, values));
  }, [currentGroup, values, isVisible]);

  const canNext = React.useMemo(() => {
    if (!visibleQuestions.length) return current < totalSteps - 1;

    const allRequiredOk = visibleQuestions.every(
      (q) => !q.required || !isEmptyValue(q, values)
    );

    return allRequiredOk;
  }, [visibleQuestions, current, totalSteps, values]);

  const next = React.useCallback(() => {
    const allRequiredOk = visibleQuestions.every(
      (q) => !q.required || !isEmptyValue(q, values)
    );

    if (!allRequiredOk) return false;

    if (current < totalSteps - 1) {
      setCurrent(current + 1);
      return true;
    }

    return true;
  }, [current, visibleQuestions, totalSteps, values]);

  const prev = React.useCallback(() => {
    if (current <= 0) return false;
    setCurrent((i) => Math.max(0, i - 1));
    return true;
  }, [current]);

  const isFinished = React.useMemo(() => {
    if (current < totalSteps - 1) return false;

    const lastGroup = groups[totalSteps - 1]?.questions || [];
    const visible = lastGroup.filter((q) => isVisible(q, values));

    if (!visible.length) return true;

    return visible.every((q) => !q.required || !isEmptyValue(q, values));
  }, [groups, current, totalSteps, values, isVisible]);

  const metaCbRef = React.useRef(onMetaChange);
  React.useEffect(() => {
    metaCbRef.current = onMetaChange;
  }, [onMetaChange]);

  React.useEffect(() => {
    metaCbRef.current?.({
      current,
      total: totalSteps,
      canNext,
      isFinished,
      next,
      prev,
    });
  }, [current, totalSteps, canNext, isFinished]);

  const renderField = (q) => {
    if (!isVisible(q, values)) return null;

    const placeholder = q.help_text || q.placeholder || '';
    const inputStyle = {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '14px',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    };

    if (q.type === 'text')
      return <input type="text" value={values[q.key] ?? ''} onChange={(e) => handleChange(q.key, e.target.value)} placeholder={placeholder} style={inputStyle} />;

    if (q.type === 'textarea')
      return <textarea value={values[q.key] ?? ''} onChange={(e) => handleChange(q.key, e.target.value)} placeholder={placeholder} rows={8} style={{ ...inputStyle, height: '180px', resize: 'vertical' }} />;

    if (q.type === 'number')
      return <input type="number" value={values[q.key] ?? ''} onChange={(e) => handleChange(q.key, e.target.value)} placeholder={placeholder} style={inputStyle} />;

    if (q.type === 'date')
      return <input type="date" value={values[q.key] ?? ''} onChange={(e) => handleChange(q.key, e.target.value)} style={inputStyle} />;

    if (q.type === 'boolean')
      return (
        <select value={String(values[q.key] ?? '')} onChange={(e) => handleChange(q.key, e.target.value === 'true')} style={inputStyle}>
          <option value="">Selecione...</option>
          <option value="true">Sim</option>
          <option value="false">Não</option>
        </select>
      );

    if (q.type === 'select') {
      const raw = Array.isArray(q.options) ? q.options : Object.values(q.options || {});
      const opts = raw.map((opt) =>
        typeof opt === 'object'
          ? { value: String(opt.value ?? opt.key ?? opt.id ?? ''), label: String(opt.label ?? opt.value ?? opt.key ?? '') }
          : { value: String(opt), label: String(opt) }
      );

      return (
        <div>
          {opts.map(({ value: val, label }) => (
            <label key={val} style={{ display: 'block', marginBottom: 6 }}>
              <input
                type="radio"
                name={`${q.key}-${form?.id || 'df'}`}
                value={val}
                checked={String(values[q.key] ?? '') === val}
                onChange={(e) => handleChange(q.key, e.target.value)}
                style={{ marginRight: 6 }}
              />
              {label}
            </label>
          ))}
        </div>
      );
    }

    if (q.type === 'multiselect') {
      const raw = Array.isArray(q.options) ? q.options : Object.values(q.options || {});
      const opts = raw.map((opt) =>
        typeof opt === 'object'
          ? { value: String(opt.value ?? opt.key ?? opt.id ?? ''), label: String(opt.label ?? opt.value ?? opt.key ?? '') }
          : { value: String(opt), label: String(opt) }
      );

      const currentVals = Array.isArray(values[q.key]) ? values[q.key] : [];

      const toggle = (v) => {
        const exists = currentVals.includes(v);
        handleChange(q.key, exists ? currentVals.filter((x) => x !== v) : [...currentVals, v]);
      };

      return (
        <div>
          {opts.map(({ value: val, label }) => (
            <label key={val} style={{ display: 'block', marginBottom: 6 }}>
              <input type="checkbox" value={val} checked={currentVals.includes(val)} onChange={(e) => toggle(e.target.value)} style={{ marginRight: 6 }} />
              {label}
            </label>
          ))}
        </div>
      );
    }

    return (
      <input type="text" value={values[q.key] ?? ''} onChange={(e) => handleChange(q.key, e.target.value)} placeholder={placeholder} style={inputStyle} />
    );
  };

  return (
    <div>
      {loading && <div>Carregando...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {Array.isArray(visibleQuestions) && visibleQuestions.length > 0 && (
        <div>
          {visibleQuestions.map((q) => (
            <div key={q.id} style={{ marginBottom: q.type === 'textarea' ? 24 : 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                {q.label} {q.required && <span style={{ color: 'red' }}>*</span>}
              </label>

              {renderField(q)}
            </div>
          ))}
        </div>
      )}

      {!loading && totalSteps === 0 && (!visibleQuestions || visibleQuestions.length === 0) && (
        <div>Nenhuma pergunta disponível.</div>
      )}
    </div>
  );
}