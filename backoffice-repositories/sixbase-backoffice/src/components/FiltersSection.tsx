import { FC, useCallback } from 'react';
import {
  Card,
  CardBody,
  Row,
  Col,
  Button,
  Label,
} from 'reactstrap';
import { Calendar} from 'react-feather';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import Select from 'react-select';
import { regions, statusOptions } from '../mocks';

const FiltersSection: FC<any> = ({
  calendar,
  selectedSeller,
  selectedProductFilter,
  selectedOptions,
  selectedRegion,
  selectedState,
  stateOptions,
  filteredSellerOptions,
  filteredProductOptions,
  sellerSearchTerm,
  productSearchTerm,
  isProductSearching,
  isSellerLoading,
  isProductLoading,
  onDateChange,
  onSellerChange,
  onProductChange,
  onStatusChange,
  onRegionChange,
  onStateChange,
  onSellerInputChange,
  onProductInputChange,
  onExportCsv,
  setQuickRange,
  showStatusFilters = true,
  showRegionFilters = true,
  extraFilters,
}) => {
  const handleTodayClick = useCallback(() => {
    const today = new Date();
    onDateChange([today, today]);
  }, [onDateChange]);
  const handle7DaysClick = useCallback(() => setQuickRange(7), [setQuickRange]);
  const handle30DaysClick = useCallback(
    () => setQuickRange(30),
    [setQuickRange],
  );
  const handle90DaysClick = useCallback(
    () => setQuickRange(90),
    [setQuickRange],
  );

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
                value={calendar}
                onChange={onDateChange}
                options={{
                  mode: 'range',
                  dateFormat: 'd/m/Y',
                }}
              />
            </div>
            <div className="d-flex flex-wrap gap-1 mt-1">
              <Button size="sm" color="primary" onClick={handleTodayClick}>
                Hoje
              </Button>
              <Button size="sm" color="primary" onClick={handle7DaysClick}>
                7 dias
              </Button>
              <Button size="sm" color="primary" onClick={handle30DaysClick}>
                30 dias
              </Button>
              <Button size="sm" color="primary" onClick={handle90DaysClick}>
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
              placeholder={
                isSellerLoading
                  ? 'Carregando produtores...'
                  : 'Digite para buscar produtor...'
              }
              options={filteredSellerOptions}
              value={selectedSeller}
              onChange={onSellerChange}
              onInputChange={onSellerInputChange}
              inputValue={sellerSearchTerm}
              isClearable
              isSearchable
              isLoading={isSellerLoading}
              filterOption={() => true}
              noOptionsMessage={() =>
                isSellerLoading
                  ? 'Carregando...'
                  : sellerSearchTerm.trim()
                  ? 'Nenhum produtor encontrado'
                  : 'Digite para buscar produtores'
              }
            />
          </Col>

          <Col xs={12} md={4}>
            <Label className="mb-1">Produto</Label>
            <Select
              classNamePrefix="select"
              className="react-select"
              placeholder={
                isProductLoading || isProductSearching
                  ? 'Carregando produtos...'
                  : 'Digite para buscar produto...'
              }
              options={filteredProductOptions}
              value={selectedProductFilter}
              onChange={onProductChange}
              onInputChange={onProductInputChange}
              inputValue={productSearchTerm}
              isClearable
              isSearchable
              isLoading={isProductLoading || isProductSearching}
              filterOption={() => true}
              noOptionsMessage={() =>
                isProductLoading || isProductSearching
                  ? 'Carregando...'
                  : productSearchTerm.trim()
                  ? 'Nenhum produto encontrado'
                  : 'Digite para buscar produtos'
              }
            />
          </Col>
        </Row>

        {(showStatusFilters || showRegionFilters) && (
          <Row className="g-2 mt-2 align-items-end">
            {showStatusFilters && (
              <Col xs={12} md={4}>
                <Label className="mb-1">Status</Label>
                <Select
                  isMulti
                  classNamePrefix="select"
                  className="react-select"
                  placeholder="Selecione opções"
                  options={statusOptions}
                  value={selectedOptions}
                  onChange={onStatusChange}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                />
              </Col>
            )}
            {showRegionFilters && (
              <>
                <Col xs={12} md={4}>
                  <Label className="mb-1">Região</Label>
                  <Select
                    classNamePrefix="select"
                    className="react-select"
                    placeholder="Selecione uma região"
                    options={regions}
                    value={selectedRegion}
                    onChange={onRegionChange}
                    isClearable
                  />
                </Col>
                <Col xs={12} md={4}>
                  <Label className="mb-1">Estado</Label>
                  <Select
                    classNamePrefix="select"
                    className="react-select"
                    placeholder="Selecione um estado"
                    options={stateOptions}
                    value={selectedState}
                    onChange={onStateChange}
                    isClearable
                    isDisabled={stateOptions.length === 0}
                  />
                </Col>
              </>
            )}
          </Row>
        )}

        {extraFilters && <div className="mt-2">{extraFilters}</div>}

        {/* Botão Exportar */}
        {/* <Row className="g-2 mt-2 align-items-end">
          <Col xs={12} className="d-flex justify-content-end">
            <Button
              color="primary"
              className="w-100 w-md-auto"
              onClick={onExportCsv}
            >
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

export default FiltersSection;
