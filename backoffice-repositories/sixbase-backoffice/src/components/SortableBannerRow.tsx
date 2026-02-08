import { FC } from 'react';
import { Button } from 'reactstrap';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BannerImage } from '../interfaces/market.interface';

interface SortableBannerRowProps {
  banner: BannerImage;
  index: number;
  onDelete: (banner: BannerImage) => void;
}

const SortableBannerRow: FC<SortableBannerRowProps> = ({ banner, index, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'move',
  };

  return (
    <tr ref={setNodeRef} style={style} {...attributes} className="sortable-row">
      <td style={{ width: 40 }}>
        <Button
          color="light"
          className="p-0"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            background: '#343d55',
            border: 'none',
            boxShadow: 'none',
          }}
          {...listeners}
        >
          <i
            className="bx bx-dots-vertical-rounded"
            style={{ fontSize: 20, color: '#6c757d' }}
          ></i>
        </Button>
      </td>
      <td>
        <span
          className="badge"
          color="primary"
          style={{ backgroundColor: '#343d55', color: 'white' }}
        >
          {index + 1}
        </span>
      </td>
      <td>
        <img
          src={banner.file}
          alt=""
          style={{ maxWidth: 200, maxHeight: 100 }}
        />
      </td>
      <td>
        <a href={banner.url} target="_blank" rel="noopener noreferrer">
          {banner.url || 'Sem link'}
        </a>
      </td>
      <td className="text-center">
        <Button
          color="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(banner);
          }}
          className="p-1"
          size="sm"
        >
          <i className="bx bx-trash-alt" style={{ fontSize: 16 }}></i>
        </Button>
      </td>
    </tr>
  );
};

export default SortableBannerRow;
