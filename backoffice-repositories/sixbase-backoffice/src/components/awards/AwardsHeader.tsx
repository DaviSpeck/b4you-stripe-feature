import { FC } from 'react';
import { Button } from 'reactstrap';
import { Upload, Plus } from 'react-feather';
import { AwardsHeaderProps } from '../../interfaces/awards.interface';

const AwardsHeader: FC<AwardsHeaderProps> = ({
  onUploadClick,
  onCreateClick,
}) => {
  return (
    <div className="mb-4 d-flex justify-content-between align-items-center">
      <h1 className="mb-0">Premiações</h1>
      <div className="d-flex gap-2">
        <Button
          color="success"
          onClick={onUploadClick}
          className="d-flex align-items-center"
        >
          <Upload size={16} className="me-2" />
          Upload em Lote
        </Button>
        <Button
          color="primary"
          onClick={onCreateClick}
          className="d-flex align-items-center"
        >
          <Plus size={16} className="me-2" />
          Cadastrar Premiação
        </Button>
      </div>
    </div>
  );
};

export default AwardsHeader;
