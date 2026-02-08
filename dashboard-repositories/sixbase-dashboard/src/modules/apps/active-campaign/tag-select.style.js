export const customStyles = {
  control: (provided) => ({
    ...provided,
    borderColor: '#DDDDDD',
    borderRadius: '.35rem',
    minHeight: '38px',
    boxShadow: 'none',
    paddingLeft: '8px',
    '&:hover': { borderColor: '#DDDDDD' },
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e9ecef',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#495057',
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#495057',
    '&:hover': {
      backgroundColor: '#ced4da',
      color: '#212529',
    },
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: '#BDBDBF',
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: '#6c757d',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '.25rem',
    border: '1px solid #ced4da',
    boxShadow: '0 0.15rem 0.5rem rgba(0, 0, 0, 0.15)',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#e9ecef' : '#ffffff',
    color: '#495057',
    '&:active': {
      backgroundColor: '#e9ecef',
      color: '#495057',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#7E8281',
    fontSize: '14px',
  }),
};
