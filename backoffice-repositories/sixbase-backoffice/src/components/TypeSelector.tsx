import { FC } from 'react';
import { Input } from 'reactstrap';

interface TypeSelectorProps {
  selectedType: number;
  onTypeChange: (type: number) => void;
  bannerTypeOptions: { id: number; name: string }[];
  showLabel?: boolean;
  width?: number;
}

const TypeSelector: FC<TypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  bannerTypeOptions,
  showLabel = true,
  width = 150,
}) => {
  return (
    <div className="d-flex align-items-center">
      {showLabel && <label className="mb-0 me-2">Tipo:</label>}
      <Input
        type="select"
        value={selectedType}
        onChange={(e) => onTypeChange(Number(e.target.value))}
        style={{ width }}
      >
        {bannerTypeOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </Input>
    </div>
  );
};

export { TypeSelector };
export default TypeSelector;
