import React, { FC } from 'react';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useDroppable } from '@dnd-kit/core';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import DraggableKanbanCard from '../DraggableKanbanCard';
import { formatDaysAgo, getFirstAndLastName } from '../utils/management.utils';
import { FormatBRL } from '../../../../../utility/Utils';
import { ManagementKanbanColumnProps } from './interfaces/management-kanban-column.interface';

const formatCurrency = (value: number | undefined): string => {
  return FormatBRL(value || 0);
};

const ManagementKanbanColumn: FC<ManagementKanbanColumnProps> = ({
  id,
  phase,
  title,
  icon,
  bgColor,
  description,
  items,
  isLoading,
  total,
  currentPage,
  totalPages,
  perPage,
  onPageChange,
  onUpdatePhase,
  skin,
  canEdit,
}) => {
  // Droppable desabilitado quando não pode editar
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled: !canEdit,
  });

  const isDark = skin === 'dark';

  // Não fazer slice local - usar diretamente os items retornados do backend
  // O backend já retorna apenas os items da página solicitada
  const paginatedItems = React.useMemo(() => {
    // O backend já retorna apenas os items da página solicitada
    // Não precisamos fazer slice local
    return items || [];
  }, [items]);

  return (
    <div
      ref={setNodeRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Card
        className="h-100 d-flex flex-column"
        style={{
          backgroundColor: isDark ? 'rgba(31, 42, 64, 0.8)' : '#ffffff',
          border:
            canEdit && isOver
              ? `2px solid ${isDark ? 'rgba(255,255,255,0.5)' : '#007bff'}`
              : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`,
          height: '100%',
          minHeight: '500px',
          transition: 'all 0.2s ease',
          borderRadius: 12,
          boxShadow:
            canEdit && isOver
              ? isDark
                ? '0 8px 24px rgba(255,255,255,0.2), 0 0 0 4px rgba(255,255,255,0.1)'
                : '0 8px 24px rgba(0,123,255,0.3), 0 0 0 4px rgba(0,123,255,0.1)'
              : isDark
              ? '0 4px 16px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)'
              : '0 4px 16px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05)',
          transform: canEdit && isOver ? 'scale(1.01)' : 'scale(1)',
        }}
      >
        <CardHeader
          style={{
            paddingBottom: description ? '8px' : undefined,
            background: 'transparent',
            borderBottom: `1px solid ${
              isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
            }`,
          }}
        >
          <div className="d-flex align-items-center justify-content-between w-100 mb-1">
            <div className="d-flex align-items-center">
              {icon}
              <h6 className="mb-0 ml-2">{title}</h6>
            </div>
            <div className="d-flex align-items-center">
              <span
                className={`ml-50 ${bgColor} text-white`}
                style={{
                  minWidth: 28,
                  height: 28,
                  padding: '0 6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: 12,
                  lineHeight: 1,
                }}
              >
                {isLoading ? (
                  <LoadingSpinner size={12} className="" showText={false} />
                ) : (
                  total
                )}
              </span>
            </div>
          </div>
          {description && (
            <small
              className="text-muted"
              style={{
                fontSize: '11px',
                lineHeight: 1.3,
                display: 'block',
                marginTop: '4px',
                wordWrap: 'break-word',
              }}
              title={description}
            >
              {description}
            </small>
          )}
        </CardHeader>

        <CardBody
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            minHeight: '400px',
            background:
              canEdit && isOver
                ? isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,123,255,0.03)'
                : 'transparent',
            transition: 'background 0.2s ease',
          }}
        >
          {isLoading ? (
            <LoadingSpinner
              size={20}
              className="py-4"
              text="Carregando..."
              showText={true}
            />
          ) : items.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '350px',
              }}
            >
              <small className="text-muted">Sem itens</small>
            </div>
          ) : (
            <div style={{ flex: 1 }}>
              {paginatedItems.map((item) => (
                <DraggableKanbanCard
                  key={`${phase}-${item.id}`}
                  item={item}
                  phase={phase}
                  skin={skin}
                  onUpdatePhase={canEdit ? onUpdatePhase : undefined}
                  getFirstAndLastName={getFirstAndLastName}
                  formatCurrency={formatCurrency}
                  formatDaysAgo={formatDaysAgo}
                  readOnly={!canEdit}
                />
              ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="d-flex justify-content-center align-items-center mt-50">
              <span
                role="button"
                aria-label="Anterior"
                onClick={() => {
                  if (currentPage > 1) {
                    // onPageChange vai atualizar o estado e fazer a requisição ao backend
                    onPageChange(currentPage - 1);
                  }
                }}
                style={{
                  cursor: currentPage > 1 ? 'pointer' : 'default',
                  opacity: currentPage > 1 ? 1 : 0.3,
                }}
              >
                <ChevronLeft size={14} />
              </span>
              <small className="text-muted mx-25">
                {currentPage} / {totalPages}
              </small>
              <span
                role="button"
                aria-label="Próximo"
                onClick={() => {
                  if (currentPage < totalPages) {
                    // onPageChange vai atualizar o estado e fazer a requisição ao backend
                    onPageChange(currentPage + 1);
                  }
                }}
                style={{
                  cursor: currentPage < totalPages ? 'pointer' : 'default',
                  opacity: currentPage < totalPages ? 1 : 0.3,
                }}
              >
                <ChevronRight size={14} />
              </span>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ManagementKanbanColumn;
