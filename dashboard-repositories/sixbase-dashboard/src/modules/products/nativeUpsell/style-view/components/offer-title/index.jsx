export const OfferTitle = (props) => {
  const { data } = props;

  if (data.title.length === 0) return <></>;

  return (
    <h2
      style={{
        textAlign: 'center',
        fontWeight: '600 !important',
        fontSize: `${data.titleSize}px`,
        color: data.titleColor,
      }}
    >
      {data.title}
    </h2>
  );
};
