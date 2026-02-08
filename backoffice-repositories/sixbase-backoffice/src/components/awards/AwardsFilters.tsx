import { FC } from 'react';
import { Nav, NavItem, NavLink, Input, Button } from 'reactstrap';
import { Calendar, Package, Truck } from 'react-feather';
import Flatpickr from 'react-flatpickr';
import '@styles/react/libs/flatpickr/flatpickr.scss';
import { AwardsFiltersProps } from '../../interfaces/awards.interface';

const AwardsFilters: FC<AwardsFiltersProps> = ({
  activeTab,
  onTabChange,
  pendingTotal,
  sentTotal,
  filter,
  onDateChange,
  onQuickRange,
  onClearFilter,
  searchText,
  onSearchChange,
}) => {
  return (
    <div className="d-flex align-items-center mb-3 gap-3">
      <Nav tabs className="mb-0 flex-shrink-0">
        <NavItem>
          <NavLink
            className={activeTab === 'pending' ? 'active' : ''}
            onClick={() => onTabChange('pending')}
            style={{ cursor: 'pointer' }}
          >
            <Package size={16} className="me-2" />
            Pendentes ({pendingTotal})
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={activeTab === 'sent' ? 'active' : ''}
            onClick={() => onTabChange('sent')}
            style={{ cursor: 'pointer' }}
          >
            <Truck size={16} className="me-2" />
            Enviados ({sentTotal})
          </NavLink>
        </NavItem>
      </Nav>

      {/* Filtro de Data */}
      <div className="d-flex align-items-center">
        <Calendar size={15} />
        <Flatpickr
          className="form-control flat-picker bg-transparent border-0 shadow-none"
          style={{ width: '210px' }}
          value={filter.calendar.length > 0 ? filter.calendar : undefined}
          onChange={onDateChange}
          options={{
            mode: 'range',
            dateFormat: 'd/m/Y',
            placeholder: 'Selecionar data',
            allowInput: true,
            defaultDate: null,
          }}
          placeholder="Selecionar data"
        />
        <div className="d-flex gap-1">
          <Button
            size="sm"
            color="primary"
            onClick={() => {
              const today = new Date();
              onDateChange([today, today]);
            }}
          >
            Hoje
          </Button>
          <Button size="sm" color="primary" onClick={() => onQuickRange(7)}>
            7 dias
          </Button>
          <Button size="sm" color="primary" onClick={() => onQuickRange(30)}>
            30 dias
          </Button>
          <Button size="sm" color="secondary" onClick={onClearFilter}>
            Limpar
          </Button>
        </div>
      </div>

      <div className="flex-grow-1">
        <Input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por nome, email ou telefone"
          className="w-100"
        />
      </div>
    </div>
  );
};

export default AwardsFilters;
