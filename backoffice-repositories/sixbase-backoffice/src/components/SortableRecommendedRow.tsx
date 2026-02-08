import { FC } from 'react';
import { Button } from 'reactstrap';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { RecommendedProductItem } from '../interfaces/market.interface';

interface SortableRecommendedRowProps {
  product: RecommendedProductItem;
  index: number;
}

const SortableRecommendedRow: FC<SortableRecommendedRowProps> = ({
  product,
  index,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.product.uuid });

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
          style={{
            backgroundColor: '#343d55',
            color: 'white',
          }}
        >
          {index + 1}
        </span>
      </td>
      <td>
        <div className="d-flex align-items-center gap-1">
          {product.product.cover && product.product.cover.length > 0 ? (
            <img
              src={product.product.cover[0].file}
              alt={product.product.name}
              style={{
                width: 32,
                height: 32,
                objectFit: 'cover',
                borderRadius: 4,
                marginRight: 8,
              }}
            />
          ) : (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                marginRight: 8,
                background: '#2b2e3b',
              }}
            />
          )}
          <Link
            to={`/producer/${
              product.product.producer?.uuid || 'unknown'
            }/product/${product.product.uuid}`}
            style={{
              color: '#4dd0bb',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.textDecoration = 'none';
            }}
          >
            {product.product.name}
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default SortableRecommendedRow;
