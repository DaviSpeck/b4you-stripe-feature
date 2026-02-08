import './style.scss';

export const Subtitle = ({
  subtitleOne,
  subtitleOneColor,
  subtitleOneSize,
  subtitleOneWeight,
  subtitleTwo,
  subtitleTwoColor,
  subtitleTwoSize,
  subtitleTwoWeight,
}) => {
  const hasSubtitleOne = Boolean(subtitleOne);
  const hasSubtitleTwo = Boolean(subtitleTwo);

  if (!hasSubtitleOne && !hasSubtitleTwo) return null;

  return (
    <p className='subtitle-title'>
      {hasSubtitleOne && (
        <span
          style={{
            color: subtitleOneColor,
            fontSize: `${subtitleOneSize}px`,
            fontWeight: subtitleOneWeight,
          }}
        >
          {subtitleOne}
        </span>
      )}

      {hasSubtitleTwo && (
        <span
          style={{
            color: subtitleTwoColor,
            fontSize: `${subtitleTwoSize}px`,
            fontWeight: subtitleTwoWeight,
          }}
        >
          {subtitleTwo}
        </span>
      )}
    </p>
  );
};