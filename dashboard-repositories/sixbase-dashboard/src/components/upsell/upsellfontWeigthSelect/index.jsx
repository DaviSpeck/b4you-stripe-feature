import { v4 as uuid } from 'uuid';
import './style.scss';
import { InputText } from '../inputText';

export const FontWeigthList = (props) => {
  const fontWeigthArr = [
    { id: uuid(), label: 100, value: 100 },
    { id: uuid(), label: 200, value: 200 },
    { id: uuid(), label: 300, value: 300 },
    { id: uuid(), label: 400, value: 400 },
    { id: uuid(), label: 500, value: 500 },
    { id: uuid(), label: 600, value: 600 },
    { id: uuid(), label: 700, value: 700 },
    { id: uuid(), label: 800, value: 800 },
    { id: uuid(), label: 900, value: 900 },
  ];

  const { disabled, form, fieldName } = props;

  return (
    <InputText.InputWrapper label='Peso da fonte'>
      <select
        id={'select-accept-action'}
        value={form.watch(fieldName)}
        disabled={disabled}
        style={{
          width: '100%',
          borderRadius: '100px',
          border: '1px solid #e0e0e0',
        }}
        onChange={(e) => form.setValue(fieldName, Number(e.target.value))}
      >
        {fontWeigthArr.map((data) => {
          return (
            <option key={data.id} value={data.value}>
              {data.label}
            </option>
          );
        })}
      </select>
    </InputText.InputWrapper>
  );
};
