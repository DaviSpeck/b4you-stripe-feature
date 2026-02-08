export const ExpandedComponent = (records) => (
  <div className='expanded-component p-2'>
    <div className='list-item d-flex gap-1 align-items-center'>
      <div className='item'>
        <span className='param'>src: </span>
        <span className='value'>{records.data.src}</span>
      </div>
      <div className='item'>
        <div className='param'>sck: </div>
        <div className='value'>{records.data.sck}</div>
      </div>
      <div className='item'>
        <div className='param'>utm_source: </div>
        <div className='value'>{records.data.utm_source}</div>
      </div>
      <div className='item'>
        <div className='param'>utm_medium: </div>
        <div className='value'>{records.data.utm_medium}</div>
      </div>
      <div className='item'>
        <div className='param'>utm_campaign: </div>
        <div className='value'>{records.data.utm_campaign}</div>
      </div>
      <div className='item'>
        <div className='param'>utm_term: </div>
        <div className='value'>{records.data.utm_term}</div>
      </div>
      <div className='item'>
        <div className='param'>utm_content: </div>
        <div className='value'>{records.data.utm_content}</div>
      </div>
    </div>
  </div>
);
