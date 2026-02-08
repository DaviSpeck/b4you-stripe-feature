const NoDataComponentContent = ({ text = 'Sem conteúdo' }) => {
  return (
    <div className='no-data-component'>
      <i class='bx bx-search'></i> {text}
    </div>
  );
};

export default NoDataComponentContent;
