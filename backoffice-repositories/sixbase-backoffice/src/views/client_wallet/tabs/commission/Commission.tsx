import '@styles/react/libs/flatpickr/flatpickr.scss';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  DollarSign,
  Edit2,
  Percent,
  TrendingUp,
  X,
} from 'react-feather';
import Flatpickr from 'react-flatpickr';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import { getUserData } from '../../../../utility/Utils';
import { api } from '../../../../services/api';
import { useSkin } from '../../../../utility/hooks/useSkin';
import StatCard from '../../../../components/common/StatCard';

export interface CommissionData {
  total_revenue: number;
  commission_percent: number;
  commission_value: number;
}

const Commission: FC = () => {
  const userData = useMemo(() => {
    try {
      return getUserData();
    } catch (_) {
      return null;
    }
  }, []);

  const role = useMemo(
    () => String(userData?.role || '').toUpperCase(),
    [userData],
  );
  const isMaster = role === 'MASTER' || role === 'ADMIN';
  const isCommercial = role === 'COMERCIAL';

  const [dateRange, setDateRange] = useState<Date[]>([
    new Date(Date.now() - 30 * 86400000),
    new Date(),
  ]);
  const [selectedManager, setSelectedManager] = useState<string | null>(
    isCommercial
      ? userData?.id != null
        ? String(userData.id)
        : null
      : isMaster
      ? null
      : null,
  );
  const [managers, setManagers] = useState<
    { id: number; full_name?: string; email: string }[]
  >([]);
  const [loadingManagers, setLoadingManagers] = useState(true);
  const [commissionData, setCommissionData] = useState<CommissionData | null>(
    null,
  );
  const [loadingCommission, setLoadingCommission] = useState(false);

  const [isEditingPercent, setIsEditingPercent] = useState(false);
  const [editPercentValue, setEditPercentValue] = useState('');
  const [savingPercent, setSavingPercent] = useState(false);

  const { skin } = useSkin();
  const isDark = skin === 'dark';

  const normalizedManagerId = useMemo(() => {
    if (isCommercial)
      return (
        selectedManager ?? (userData?.id != null ? String(userData.id) : null)
      );
    if (isMaster) return selectedManager;
    return null;
  }, [selectedManager, isCommercial, isMaster, userData?.id]);

  const canEditPercent = isMaster && selectedManager != null && selectedManager !== '';

  const fetchManagers = useCallback(async () => {
    setLoadingManagers(true);
    try {
      const { data } = await api.get<{
        managers: { id: number; full_name?: string; email: string }[];
      }>('/client-wallet/managers');
      setManagers(data.managers ?? []);
    } catch (err) {
      console.error('Erro ao buscar gerentes:', err);
    } finally {
      setLoadingManagers(false);
    }
  }, []);

  const fetchCommission = useCallback(async () => {
    if (!dateRange[0] || !dateRange[1]) return;
    setLoadingCommission(true);
    try {
      const params: Record<string, string> = {
        start_date: dateRange[0].toISOString().slice(0, 10),
        end_date: dateRange[1].toISOString().slice(0, 10),
      };
      if (normalizedManagerId != null && normalizedManagerId !== '') {
        params.manager_id = String(normalizedManagerId);
      }
      const { data } = await api.get<CommissionData>(
        '/client-wallet/commission',
        { params },
      );
      setCommissionData(data);
    } catch (err) {
      console.error('Erro ao buscar comissão:', err);
      setCommissionData(null);
    } finally {
      setLoadingCommission(false);
    }
  }, [dateRange, normalizedManagerId]);

  const handleStartEdit = () => {
    setEditPercentValue(String(commissionData?.commission_percent ?? 0.01));
    setIsEditingPercent(true);
  };

  const handleCancelEdit = () => {
    setIsEditingPercent(false);
    setEditPercentValue('');
  };

  const handleSavePercent = async () => {
    if (!selectedManager) return;

    const value = parseFloat(editPercentValue);
    if (isNaN(value) || value < 0 || value > 100) {
      toast.error('Percentual deve estar entre 0 e 100');
      return;
    }

    setSavingPercent(true);
    try {
      await api.put(`/client-wallet/managers/${selectedManager}/commission`, {
        commission_percent: value,
      });
      toast.success('Percentual de comissão atualizado com sucesso!');
      setIsEditingPercent(false);
      fetchCommission();
    } catch (err) {
      console.error('Erro ao salvar comissão:', err);
      toast.error('Erro ao salvar percentual de comissão');
    } finally {
      setSavingPercent(false);
    }
  };

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  useEffect(() => {
    fetchCommission();
  }, [fetchCommission]);

  useEffect(() => {
    setIsEditingPercent(false);
    setEditPercentValue('');
  }, [selectedManager]);

  return (
    <>
      <Card className="mb-3">
        <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-1">
          <h4 className="mb-0">Comissão</h4>
          <div className="d-flex align-items-center flex-wrap gap-1">
            {isMaster && (
              <div className="d-flex align-items-center gap-50">
                <Label className="mb-0 text-nowrap">Gerente:</Label>
                <Input
                  type="select"
                  value={selectedManager ?? ''}
                  onChange={(e) => setSelectedManager(e.target.value || null)}
                  style={{ width: 200, minWidth: 150 }}
                  disabled={loadingManagers}
                >
                  <option value="">Todos os gerentes</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.email}
                    </option>
                  ))}
                </Input>
              </div>
            )}
            {canEditPercent && (
              <div className="d-flex align-items-center flex-wrap gap-50">
                <Label className="mb-0 text-nowrap">Comissão %:</Label>
                {isEditingPercent ? (
                  <div className="d-flex align-items-center gap-50">
                    <InputGroup style={{ width: 120, minWidth: 100 }}>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={editPercentValue}
                        onChange={(e) => setEditPercentValue(e.target.value)}
                        disabled={savingPercent}
                        style={{ textAlign: 'right' }}
                      />
                      <InputGroupText>%</InputGroupText>
                    </InputGroup>
                    <div className="d-flex gap-25">
                      <Button
                        color="success"
                        size="sm"
                        onClick={handleSavePercent}
                        disabled={savingPercent}
                        className="btn-icon"
                        style={{ padding: '0.4rem' }}
                      >
                        {savingPercent ? (
                          <Spinner size="sm" style={{ width: 14, height: 14 }} />
                        ) : (
                          <Check size={14} />
                        )}
                      </Button>
                      <Button
                        color="flat-secondary"
                        size="sm"
                        onClick={handleCancelEdit}
                        disabled={savingPercent}
                        className="btn-icon"
                        style={{ padding: '0.4rem' }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex align-items-center gap-25">
                    <span
                      className="font-weight-bold"
                      style={{ minWidth: 45, textAlign: 'right' }}
                    >
                      {commissionData?.commission_percent ?? 0.01}%
                    </span>
                    <Button
                      color="flat-primary"
                      size="sm"
                      onClick={handleStartEdit}
                      className="btn-icon rounded-circle"
                      style={{ padding: '0.3rem' }}
                    >
                      <Edit2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            )}
            <div className="d-flex align-items-center gap-50">
              <Calendar size={15} />
              <Flatpickr
                className="form-control"
                style={{ width: 220, minWidth: 180 }}
                value={dateRange}
                onChange={(dates) => setDateRange(dates as Date[])}
                options={{
                  mode: 'range',
                  dateFormat: 'd/m/Y',
                  defaultDate: [
                    new Date(Date.now() - 30 * 86400000),
                    new Date(),
                  ],
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Row className="mt-2">
        <Col xs={12}>
          <Card style={{ border: 0, background: 'transparent' }}>
            <CardHeader
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
              }}
            >
              <h5
                className="mb-1"
                style={{
                  color: isDark ? '#ffffff' : '#1e293b',
                  fontWeight: 600,
                }}
              >
                Comissão
              </h5>
              <hr
                style={{
                  borderColor: isDark ? '#2f3a4f' : '#e2e8f0',
                }}
              />
            </CardHeader>
            <CardBody
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #1f2a40 0%, #121826 100%)'
                  : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: 12,
                padding: 20,
                border: isDark ? '1px solid #2f3a4f' : '1px solid #e2e8f0',
                boxShadow: isDark
                  ? '0 2px 8px rgba(0, 0, 0, 0.35)'
                  : '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              {loadingCommission ? (
                <Row>
                  <Col xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Faturamento total (período)"
                      value={0}
                      icon={TrendingUp}
                      isMonetary={true}
                      tooltip="Faturamento total da carteira no período selecionado, utilizado como base para o cálculo da comissão."
                      loading={true}
                      animate={false}
                      valueColor="#22c55e"
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Percentual aplicado"
                      value="0%"
                      icon={Percent}
                      isMonetary={false}
                      tooltip="Percentual de comissão configurado para o gerente selecionado."
                      loading={true}
                      animate={false}
                      valueColor="#3b82f6"
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Valor da comissão"
                      value={0}
                      icon={DollarSign}
                      isMonetary={true}
                      tooltip="Valor da comissão do gerente, calculada automaticamente com base no percentual configurado."
                      loading={true}
                      animate={false}
                      valueColor="#22c55e"
                    />
                  </Col>
                </Row>
              ) : commissionData ? (
                <Row>
                  <Col xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Faturamento total (período)"
                      value={commissionData.total_revenue}
                      icon={TrendingUp}
                      isMonetary={true}
                      tooltip="Faturamento total da carteira no período selecionado, utilizado como base para o cálculo da comissão."
                      loading={false}
                      animate={true}
                      valueColor="#22c55e"
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Percentual aplicado"
                      value={`${commissionData.commission_percent}%`}
                      icon={Percent}
                      isMonetary={false}
                      tooltip="Percentual de comissão configurado para o gerente selecionado."
                      loading={false}
                      animate={false}
                      valueColor="#3b82f6"
                    />
                  </Col>
                  <Col xs={12} sm={6} lg={4}>
                    <StatCard
                      title="Valor da comissão"
                      value={commissionData.commission_value}
                      icon={DollarSign}
                      isMonetary={true}
                      tooltip="Valor da comissão do gerente, calculada automaticamente com base no percentual configurado."
                      loading={false}
                      animate={true}
                      valueColor="#22c55e"
                    />
                  </Col>
                </Row>
              ) : (
                <p className="mb-0 text-muted">
                  Nenhum dado de comissão disponível para o período e filtros
                  selecionados.
                </p>
              )}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Commission;
