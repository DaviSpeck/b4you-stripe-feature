import React from 'react';

const MediaType = ({ type }) => {
  if (type === 'video') {
    return (
      <>
        <div className='method'>
          <i className='bx bx-camera' />
          <span>Curso em Vídeo</span>
        </div>
      </>
    );
  }
  if (type === 'ebook') {
    return (
      <>
        <div className='method'>
          <i className='bx bx-book' />
          <span>E-book</span>
        </div>
      </>
    );
  }
  if (type === 'physical') {
    return (
      <>
        <div className='method'>
          <i className='bx bx-box' />
          <span>Físico</span>
        </div>
      </>
    );
  }

  return true;
};

export default MediaType;
