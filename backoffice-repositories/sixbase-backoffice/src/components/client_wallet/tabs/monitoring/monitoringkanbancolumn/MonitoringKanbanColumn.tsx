import { FC, useMemo } from 'react';
import { Col } from 'reactstrap';
import { ChevronLeft, ChevronRight } from 'react-feather';
import KanbanColumnCard from '../../../../client_wallet/kanbancolumncard/KanbanColumnCard';
import LoadingSpinner from '../../../../../components/LoadingSpinner';
import MonitoringKanbanCard from '../monitoringkanbancard/MonitoringKanbanCard';
import { stageDotClass, getStageDescription } from '../utils/stage.utils';
import { MonitoringKanbanColumnProps } from './interfaces/monitoring-kanban-column';

const MonitoringKanbanColumn: FC<MonitoringKanbanColumnProps> = ({
  title,
  stage,
  icon,
  count,
  loadingCount,
  allItems,
  loadingItems,
  currentPage,
  perPage,
  onPageChange,
  onFetchPage,
}) => {
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(count / perPage)),
    [count, perPage],
  );

  const safePage = useMemo(
    () => Math.min(currentPage, totalPages),
    [currentPage, totalPages],
  );

  // Não fazer slice local - usar diretamente os items retornados do backend
  // O backend já retorna apenas os items da página solicitada
  const pageItems = useMemo(() => {
    // Se allItems tem menos itens que o esperado para a página atual,
    // significa que ainda não carregamos essa página do backend
    // Nesse caso, retornar os itens disponíveis ou array vazio
    return allItems || [];
  }, [allItems]);

  return (
    <Col lg="3" md="6" sm="12" className="mb-2">
      <KanbanColumnCard
        title={title}
        icon={icon}
        badgeColorClass={stageDotClass(stage)}
        count={count}
        loadingCount={loadingCount}
        description={getStageDescription(stage)}
      >
        {loadingItems ? (
          <LoadingSpinner
            size={20}
            className="py-4"
            text="Carregando..."
            showText={true}
          />
        ) : pageItems.length === 0 ? (
          <small className="text-muted">Sem itens</small>
        ) : (
          <>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto',
                minHeight: '320px',
              }}
            >
              {pageItems.map((item) => (
                <MonitoringKanbanCard key={`${stage}-${item.id}`} item={item} />
              ))}
            </div>
            <div className="d-flex justify-content-center align-items-center mt-50">
              <span
                role="button"
                aria-label="Anterior"
                onClick={() => {
                  if (safePage > 1) {
                    const newPage = Math.max(1, safePage - 1);
                    // Primeiro atualizar o estado da página
                    onPageChange(stage, newPage);
                    // Depois buscar os dados do backend para essa página
                    onFetchPage(stage, newPage);
                  }
                }}
                style={{
                  cursor: safePage > 1 ? 'pointer' : 'default',
                  opacity: safePage > 1 ? 1 : 0.3,
                }}
              >
                <ChevronLeft size={14} />
              </span>
              <small className="text-muted mx-25">
                {safePage} / {totalPages}
              </small>
              <span
                role="button"
                aria-label="Próximo"
                onClick={() => {
                  if (safePage < totalPages) {
                    const newPage = Math.min(totalPages, safePage + 1);
                    // Primeiro atualizar o estado da página
                    onPageChange(stage, newPage);
                    // Depois buscar os dados do backend para essa página
                    onFetchPage(stage, newPage);
                  }
                }}
                style={{
                  cursor: safePage < totalPages ? 'pointer' : 'default',
                  opacity: safePage < totalPages ? 1 : 0.3,
                }}
              >
                <ChevronRight size={14} />
              </span>
            </div>
          </>
        )}
      </KanbanColumnCard>
    </Col>
  );
};

export default MonitoringKanbanColumn;
