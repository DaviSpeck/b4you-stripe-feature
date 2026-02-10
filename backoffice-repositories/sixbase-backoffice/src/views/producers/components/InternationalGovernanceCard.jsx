import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Button,
  Card,
  CardBody,
  Col,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import { configNotify } from '../../../configs/toastConfig';
import { api } from '../../../services/api';

const initialGovernance = {
  international_status: 'blocked',
  international_stripe_enabled: false,
  international_rules: {},
  international_status_updated_at: null,
  international_status_updated_by: null,
};

const InternationalGovernanceCard = ({ userUuid }) => {
  const [governance, setGovernance] = useState(initialGovernance);
  const [reason, setReason] = useState('');
  const [rulesText, setRulesText] = useState('{}');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadGovernance = async () => {
    if (!userUuid) return;

    try {
      setLoading(true);
      const { data } = await api.get(
        `/users/${userUuid}/international-governance`,
      );
      setGovernance({ ...initialGovernance, ...data });
      setRulesText(JSON.stringify(data?.international_rules || {}, null, 2));
    } catch (error) {
      toast.error('Erro ao carregar governança internacional', configNotify);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGovernance();
  }, [userUuid]);

  const handleSave = async () => {
    let parsedRules = {};

    try {
      parsedRules = rulesText ? JSON.parse(rulesText) : {};
    } catch (error) {
      toast.error('Rules deve ser um JSON válido', configNotify);
      return;
    }

    try {
      setSaving(true);
      await api.patch(`/users/${userUuid}/international-governance`, {
        status: governance.international_status,
        international_stripe_enabled: governance.international_stripe_enabled,
        rules: parsedRules,
        reason,
      });

      toast.success('Governança internacional atualizada com sucesso', configNotify);
      setReason('');
      await loadGovernance();
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Erro ao atualizar governança internacional';
      toast.error(message, configNotify);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card style={{ height: '100%' }}>
      <CardBody>
        <h6 className="mb-1">Governança Internacional</h6>
        {loading ? (
          <div className="text-center py-2">
            <Spinner size="sm" color="primary" />
          </div>
        ) : (
          <>
            <Row>
              <Col xs="12" className="mb-1">
                <Label className="mb-0">Status internacional</Label>
                <Input
                  aria-label="Status internacional"
                  type="select"
                  value={governance.international_status}
                  onChange={(event) =>
                    setGovernance((prev) => ({
                      ...prev,
                      international_status: event.target.value,
                    }))
                  }
                >
                  <option value="blocked">blocked</option>
                  <option value="enabled">enabled</option>
                </Input>
              </Col>

              <Col xs="12" className="mb-1">
                <FormGroup switch className="mb-0">
                  <Input
                    aria-label="Stripe internacional habilitada"
                    type="switch"
                    checked={Boolean(governance.international_stripe_enabled)}
                    onChange={(event) =>
                      setGovernance((prev) => ({
                        ...prev,
                        international_stripe_enabled: event.target.checked,
                      }))
                    }
                  />
                  <Label check>Stripe internacional habilitada</Label>
                </FormGroup>
              </Col>

              <Col xs="12" className="mb-1">
                <Label className="mb-0">Rules (JSON)</Label>
                <Input
                  aria-label="Rules (JSON)"
                  type="textarea"
                  rows="4"
                  value={rulesText}
                  onChange={(event) => setRulesText(event.target.value)}
                />
              </Col>

              <Col xs="12" className="mb-1">
                <Label className="mb-0">Motivo</Label>
                <Input
                  aria-label="Motivo"
                  type="text"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Motivo da alteração"
                />
              </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mt-1">
              <small className="text-muted">
                Última atualização:{' '}
                {governance.international_status_updated_at
                  ? new Date(
                    governance.international_status_updated_at,
                  ).toLocaleString('pt-BR')
                  : 'N/A'}{' '}
                | Autor:{' '}
                {governance.international_status_updated_by || 'N/A'}
              </small>
            </div>

            <Button
              color="primary"
              size="sm"
              className="mt-1"
              disabled={saving || !reason.trim()}
              onClick={handleSave}
            >
              {saving ? 'Salvando...' : 'Salvar governança'}
            </Button>
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default InternationalGovernanceCard;
