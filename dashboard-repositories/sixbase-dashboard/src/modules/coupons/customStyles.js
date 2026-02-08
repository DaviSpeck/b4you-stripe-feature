export const customStyles = {
  container: (provided) => ({
    ...provided,
    width: 220,
    '@media (max-width: 576px)': {
      width: '100%',
    },
  }),
  control: (provided, state) => ({
    ...provided,
    borderRadius: '12px',
    height: '40px',
    borderColor: state.isFocused ? '#5bebd4' : '#dadce0',
    boxShadow: 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#5bebd4' : '#dadce0',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#aaa',
    fontSize: '14px',
    fontWeight: '400',
  }),
};
