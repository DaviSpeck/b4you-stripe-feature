const Avatar = ({ picture, fullName, staff }) => {
  const getInitials = () => {
    let names = fullName.split(' ');

    let firstLetter = names[0].substring(0, 1);
    let lastLetter = '';
    if (names.length > 1) {
      lastLetter = names[names.length - 1].substring(0, 1);
    } else {
      lastLetter = names[0].substring(1, 2);
    }
    let initials = firstLetter + lastLetter;
    return initials.toUpperCase();
  };

  return (
    <>
      <div className='c-avatar'>
        {staff && (
          <div className='icon'>
            <i className='la la-crown' />
          </div>
        )}
        <div className={staff ? 'avatar staff' : 'avatar'}>
          {picture ? (
            <img src={picture} />
          ) : (
            <div className='avatar-made'>{getInitials()}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default Avatar;
