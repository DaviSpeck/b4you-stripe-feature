import { FC } from 'react';
import { Card, CardBody, CardTitle, Row, Col, Label, Button } from 'reactstrap';
import { Calendar, Filter, FileText } from 'react-feather';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import Select from 'react-select';

const FiltersSkeleton: FC = () => {
  return (
    <Card className="mb-2">
      <CardBody>
        {/* <CardTitle tag="h4" className="mb-2 d-flex justify-content-center">
          <span className="mr-1">Filtros</span>
          <Filter size={15} />
        </CardTitle> */}

        {/* Filtros de Data */}
        <Row className="g-2 align-items-end">
          <Col xs={12} md={4}>
            <Label className="mb-1">Intervalo de datas</Label>
            <div className="d-flex align-items-center">
              <Calendar size={15} />
              <Flatpickr
                className="form-control flat-picker bg-transparent border-0 shadow-none"
                options={{
                  mode: 'range',
                  dateFormat: 'd/m/Y',
                }}
                disabled
              />
            </div>
            <div className="d-flex flex-wrap gap-1 mt-1">
              <Button size="sm" color="primary" disabled>
                Hoje
              </Button>
              <Button size="sm" color="primary" disabled>
                7 dias
              </Button>
              <Button size="sm" color="primary" disabled>
                30 dias
              </Button>
              <Button size="sm" color="primary" disabled>
                90 dias
              </Button>
            </div>
          </Col>

          {/* Filtros de Produto/Oferta */}
          <Col xs={12} md={4}>
            <Label className="mb-1">Produtor</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Digite para buscar produtor..."
              options={[]}
              isClearable
              isSearchable
              isDisabled
            />
          </Col>

          <Col xs={12} md={4}>
            <Label className="mb-1">Produto</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Digite para buscar produto..."
              options={[]}
              isClearable
              isSearchable
              isDisabled
            />
          </Col>
        </Row>

        {/* Filtros de Status e Região */}
        <Row className="g-2 mt-2 align-items-end">
          <Col xs={12} md={4}>
            <Label className="mb-1">Status</Label>
            <Select
              isMulti
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione opções"
              options={[]}
              closeMenuOnSelect={false}
              hideSelectedOptions={false}
              isDisabled
            />
          </Col>
          <Col xs={12} md={4}>
            <Label className="mb-1">Região</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione uma região"
              options={[]}
              isClearable
              isDisabled
            />
          </Col>
          <Col xs={12} md={4}>
            <Label className="mb-1">Estado</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder="Selecione um estado"
              options={[]}
              isClearable
              isDisabled
            />
          </Col>
        </Row>

        {/* Botão Exportar */}
        {/* <Row className="g-2 mt-2 align-items-end">
          <Col xs={12} className="d-flex justify-content-end">
            <Button color="primary" className="w-100 w-md-auto" disabled>
              <div className="d-flex justify-content-center align-items-center gap-1">
                <span className="ms-1">Exportar CSV</span>
                <FileText size={15} />
              </div>
            </Button>
          </Col>
        </Row> */}
      </CardBody>
    </Card>
  );
};

export default FiltersSkeleton;
