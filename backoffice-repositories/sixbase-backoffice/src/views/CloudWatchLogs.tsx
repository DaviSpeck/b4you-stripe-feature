import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
  Button,
  Row,
  Col,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
} from 'reactstrap';
import { api } from '../services/api';
import moment from 'moment';
import { useSkin } from '../utility/hooks/useSkin';
import { ChevronDown, ChevronUp, Copy, Check } from 'react-feather';

interface CloudWatchLog {
  timestamp: string;
  message: string;
  logStreamName: string;
}

interface LogsResponse {
  logGroup: string;
  filterPattern: string;
  hours: number;
  startTime: string;
  endTime: string;
  total: number;
  logs: CloudWatchLog[];
}

interface PatternsResponse {
  patterns: string[];
  logGroups: string[];
}

interface ParsedLogMessage {
  prefix?: string;
  jsonData?: any;
  rawMessage: string;
  error?: string;
  errorType?: string;
  endpoint?: string;
  offerId?: string;
  offerName?: string;
  logType?:
    | 'pix_sale_execution'
    | 'error_frontend'
    | 'pix_generation_error'
    | 'card_generation_error'
    | 'default';
  executionTime?: string;
  pixSaleBody?: any;
  pixErrorId?: string;
  pixErrorMethod?: string;
  pixErrorUrl?: string;
  pixErrorBody?: any;
  pixErrorCode?: number;
  pixErrorMessage?: string;
  pixErrorStack?: string;
  cardErrorId?: string;
  cardErrorMethod?: string;
  cardErrorUrl?: string;
  cardErrorBody?: any;
  cardErrorCode?: number;
  cardErrorMessage?: string;
}

const CloudWatchLogs: React.FC = () => {
  const [logs, setLogs] = useState<CloudWatchLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [logGroups, setLogGroups] = useState<string[]>([]);
  const [hours, setHours] = useState<number>(1);
  const [logGroup, setLogGroup] = useState<string>('checkout');
  const [filterPattern, setFilterPattern] = useState<string>('');
  const [responseInfo, setResponseInfo] = useState<Partial<LogsResponse>>({});
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedLog, setSelectedLog] = useState<CloudWatchLog | null>(null);
  const [copiedLogId, setCopiedLogId] = useState<string | null>(null);
  const { skin } = useSkin();

  const getLogId = (log: CloudWatchLog): string => {
    return `${log.timestamp}-${log.logStreamName}`;
  };

  const fetchPatterns = useCallback(async () => {
    try {
      const response = await api.get<PatternsResponse>('/cloudwatch/patterns');
      setPatterns(response.data.patterns);
      setLogGroups(response.data.logGroups);
      if (response.data.patterns.length > 0 && !filterPattern) {
        setFilterPattern(response.data.patterns[0]);
      }
    } catch (err: any) {
      console.error('Erro ao buscar padrões:', err);
      setError('Erro ao carregar padrões disponíveis');
    }
  }, [filterPattern]);

  const fetchLogs = useCallback(async () => {
    if (!filterPattern) {
      setError('Selecione um padrão de filtro');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        hours: hours.toString(),
        logGroup: logGroup,
        filterPattern: filterPattern,
      });

      const response = await api.get<LogsResponse>(
        `/cloudwatch?${params.toString()}`,
      );
      setLogs(response.data.logs);
      setResponseInfo({
        logGroup: response.data.logGroup,
        filterPattern: response.data.filterPattern,
        hours: response.data.hours,
        startTime: response.data.startTime,
        endTime: response.data.endTime,
        total: response.data.total,
      });
    } catch (err: any) {
      console.error('Erro ao buscar logs:', err);
      setError(
        err.response?.data?.error ||
          'Erro ao buscar logs. Verifique os parâmetros e tente novamente.',
      );
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [hours, logGroup, filterPattern]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  const parseLogMessage = useCallback((message: string): ParsedLogMessage => {
    const result: ParsedLogMessage = {
      rawMessage: message,
    };

    try {
      // Detecta Erro CARTÃO
      if (message.includes('Erro CARTÃO')) {
        result.logType = 'card_generation_error';

        // Extrai ID (pode estar no início)
        const idMatch = message.match(/^([a-f0-9-]+)Erro CARTÃO/);
        if (idMatch) {
          result.cardErrorId = idMatch[1];
        }

        // Extrai ERROR
        const errorMatch = message.match(/\*\*ERROR\s*->\s*({.+?})\s*\|\s*method:/);
        if (errorMatch) {
          try {
            const errorData = JSON.parse(errorMatch[1]);
            result.cardErrorCode = errorData.code;
            result.cardErrorMessage = errorData.message;
            result.error = errorData.message;
            result.errorType = `Erro ${errorData.code}`;
          } catch {
            // Se não conseguir fazer parse do erro, tenta extrair como string
            const errorStr = errorMatch[1];
            result.cardErrorMessage = errorStr;
            result.error = errorStr;
          }
        }

        // Extrai method
        const methodMatch = message.match(/method:\s*(\w+)/);
        if (methodMatch) {
          result.cardErrorMethod = methodMatch[1];
        }

        // Extrai URL
        const urlMatch = message.match(/url:\s*([^\s|]+)/);
        if (urlMatch) {
          result.cardErrorUrl = urlMatch[1];
        }

        // Extrai body (JSON) - procura desde "body:" até o final ou próximo separador
        const bodyStart = message.indexOf('body:');
        if (bodyStart !== -1) {
          const bodyStr = message.substring(bodyStart + 5).trim();
          try {
            result.cardErrorBody = JSON.parse(bodyStr);
            result.jsonData = result.cardErrorBody;
          } catch {
            // Se não conseguir fazer parse do body, mantém como string
            result.cardErrorBody = bodyStr;
          }
        }

        return result;
      }

      // Detecta Erro ao gerar PIX
      if (message.includes('Erro ao gerar PIX')) {
        result.logType = 'pix_generation_error';

        // Extrai ID
        const idMatch = message.match(/^([a-f0-9-]+)\s*\([^)]+\)/);
        if (idMatch) {
          result.pixErrorId = idMatch[1];
        }

        // Extrai method
        const methodMatch = message.match(/method:\s*(\w+)/);
        if (methodMatch) {
          result.pixErrorMethod = methodMatch[1];
        }

        // Extrai URL
        const urlMatch = message.match(/url:\s*([^\s|]+)/);
        if (urlMatch) {
          result.pixErrorUrl = urlMatch[1];
        }

        // Extrai body (JSON) - procura desde "body:" até "| **ERROR"
        const bodyStart = message.indexOf('body:');
        const errorStart = message.indexOf('| **ERROR');
        if (bodyStart !== -1 && errorStart !== -1 && errorStart > bodyStart) {
          const bodyStr = message.substring(bodyStart + 5, errorStart).trim();
          try {
            result.pixErrorBody = JSON.parse(bodyStr);
            result.jsonData = result.pixErrorBody;
          } catch {
            // Se não conseguir fazer parse do body, mantém como string
            result.pixErrorBody = bodyStr;
          }
        }

        // Extrai ERROR
        const errorMatch = message.match(
          /\*\*ERROR\s*->\s*({.+?})\s*\|\s*stack:/,
        );
        if (errorMatch) {
          try {
            const errorData = JSON.parse(errorMatch[1]);
            result.pixErrorCode = errorData.code;
            result.pixErrorMessage = errorData.message;
            result.error = errorData.message;
            result.errorType = `Erro ${errorData.code}`;
          } catch {
            // Se não conseguir fazer parse do erro, tenta extrair como string
            const errorStr = errorMatch[1];
            result.pixErrorMessage = errorStr;
            result.error = errorStr;
          }
        }

        // Extrai stack
        const stackMatch = message.match(/stack:\s*(.+)$/);
        if (stackMatch) {
          result.pixErrorStack =
            stackMatch[1] === 'undefined' ? undefined : stackMatch[1];
        }

        return result;
      }

      // Detecta PIX Sale Execution
      const pixSaleMatch = message.match(
        /^\[PIX Sale Execution\]\s*Time:\s*(\d+ms)\s*\|\s*Body:\s*(.+)$/,
      );
      if (pixSaleMatch) {
        result.logType = 'pix_sale_execution';
        result.executionTime = pixSaleMatch[1];
        const bodyPart = pixSaleMatch[2];
        try {
          result.pixSaleBody = JSON.parse(bodyPart);
          result.jsonData = result.pixSaleBody;
        } catch {
          // Se não conseguir fazer parse do JSON
        }
        return result;
      }

      // Tenta extrair o prefixo (ex: "ERROR FRONTEND")
      const prefixMatch = message.match(/^([A-Z\s]+)\s*(.+)$/);
      if (prefixMatch) {
        result.prefix = prefixMatch[1].trim();
        result.logType = result.prefix.includes('ERROR')
          ? 'error_frontend'
          : 'default';
        const jsonPart = prefixMatch[2];

        // Tenta fazer parse do JSON
        try {
          result.jsonData = JSON.parse(jsonPart);
          result.error = result.jsonData.error;
          result.errorType = result.jsonData.error_type;
          result.endpoint = result.jsonData.context?.endpoint;
          result.offerId = result.jsonData.context?.offer_id;
          result.offerName = result.jsonData.context?.offer_name;
        } catch {
          // Se não for JSON válido, mantém como texto
        }
      } else {
        // Tenta fazer parse direto do JSON
        try {
          result.jsonData = JSON.parse(message);
          result.error = result.jsonData.error;
          result.errorType = result.jsonData.error_type;
          result.endpoint = result.jsonData.context?.endpoint;
          result.offerId = result.jsonData.context?.offer_id;
          result.offerName = result.jsonData.context?.offer_name;
        } catch {
          // Não é JSON válido
        }
      }
    } catch (err) {
      // Erro ao processar, mantém mensagem original
    }

    return result;
  }, []);

  const toggleRowExpansion = (logId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  const copyToClipboard = async (text: string, logId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLogId(logId);
      setTimeout(() => setCopiedLogId(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: 'Data',
        selector: (row: CloudWatchLog) => row.timestamp,
        format: (row: CloudWatchLog) =>
          moment(row.timestamp).format('DD/MM/YYYY HH:mm:ss'),
        sortable: true,
        width: '150px',
        compact: true,
      },
      {
        name: 'Mensagem',
        grow: 1,
        cell: (row: CloudWatchLog) => {
          const parsed = parseLogMessage(row.message);
          const logId = getLogId(row);
          const isExpanded = expandedRows.has(logId);
          const previewLength = 200;

          // Visualizador específico para Erro CARTÃO
          if (parsed.logType === 'card_generation_error') {
            const body = parsed.cardErrorBody;
            const hasParsedData =
              body && typeof body === 'object' && !Array.isArray(body);
            return (
              <div>
                <div
                  style={{
                    backgroundColor: '#1e1e1e',
                    color: '#ffffff',
                    padding: '16px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                  }}
                >
                  <div className="mb-3">
                    <Badge
                      color="danger"
                      style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                    >
                      Erro CARTÃO
                    </Badge>
                    {parsed.cardErrorCode && (
                      <Badge
                        color="warning"
                        className="ms-2"
                        style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                      >
                        Código: {parsed.cardErrorCode}
                      </Badge>
                    )}
                    {parsed.cardErrorId && (
                      <Badge
                        color="secondary"
                        className="ms-2"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        ID: {parsed.cardErrorId}
                      </Badge>
                    )}
                  </div>

                  {parsed.cardErrorMessage && (
                    <div
                      className="mb-3"
                      style={{
                        padding: '12px',
                        backgroundColor: '#2d1b1b',
                        borderRadius: '4px',
                        border: '1px solid #dc3545',
                      }}
                    >
                      <strong style={{ color: '#ff6b6b' }}>
                        Mensagem de Erro:
                      </strong>
                      <div
                        style={{
                          marginTop: '4px',
                          color: '#ffffff',
                          fontWeight: 'bold',
                        }}
                      >
                        {parsed.cardErrorMessage}
                      </div>
                    </div>
                  )}

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong style={{ color: '#ff6b6b' }}>
                          Requisição:
                        </strong>
                        <div style={{ marginTop: '4px', paddingLeft: '12px' }}>
                          {parsed.cardErrorMethod && (
                            <div>
                              <strong>Method:</strong>{' '}
                              <Badge color="info">
                                {parsed.cardErrorMethod}
                              </Badge>
                            </div>
                          )}
                          {parsed.cardErrorUrl && (
                            <div
                              style={{
                                marginTop: '4px',
                                wordBreak: 'break-all',
                              }}
                            >
                              <strong>URL:</strong> {parsed.cardErrorUrl}
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                    {hasParsedData && body && (
                      <Col md={6}>
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>Oferta:</strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            {body.offer_id && (
                              <div>
                                <strong>ID:</strong> {body.offer_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>

                  {hasParsedData && body && (
                    <>
                      {body.full_name && (
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>
                            Cliente:
                          </strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            <div>
                              <strong>Nome:</strong> {body.full_name}
                            </div>
                            {body.email && (
                              <div>
                                <strong>Email:</strong> {body.email}
                              </div>
                            )}
                            {body.document_number && (
                              <div>
                                <strong>CPF:</strong> {body.document_number}
                              </div>
                            )}
                            {body.whatsapp && (
                              <div>
                                <strong>WhatsApp:</strong> {body.whatsapp}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {body.card && (
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>
                            Cartão:
                          </strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            {body.card.card_holder && (
                              <div>
                                <strong>Portador:</strong> {body.card.card_holder}
                              </div>
                            )}
                            {body.card.card_number && (
                              <div>
                                <strong>Número:</strong>{' '}
                                {body.card.card_number.substring(0, 4)} **** ****{' '}
                                {body.card.card_number.substring(
                                  body.card.card_number.length - 4,
                                )}
                              </div>
                            )}
                            {body.card.expiration_date && (
                              <div>
                                <strong>Validade:</strong>{' '}
                                {body.card.expiration_date}
                              </div>
                            )}
                            {body.card.installments && (
                              <div>
                                <strong>Parcelas:</strong>{' '}
                                {body.card.installments}x
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {body.address && (
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>
                            Endereço:
                          </strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            {body.address.street && (
                              <div>
                                {body.address.street}
                                {body.address.number && `, ${body.address.number}`}
                                {body.address.complement &&
                                  ` - ${body.address.complement}`}
                              </div>
                            )}
                            {body.address.neighborhood && (
                              <div>
                                {body.address.neighborhood}
                                {body.address.city &&
                                  ` - ${body.address.city}`}
                                {body.address.state && `/${body.address.state}`}
                              </div>
                            )}
                            {body.address.zipcode && (
                              <div>CEP: {body.address.zipcode}</div>
                            )}
                            {!body.address.street && (
                              <div style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
                                ⚠ Endereço incompleto
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!hasParsedData && body && (
                    <div className="mb-3">
                      <strong style={{ color: '#ff6b6b' }}>
                        Body (não parseado):
                      </strong>
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '12px',
                          backgroundColor: '#000000',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxHeight: '200px',
                          overflow: 'auto',
                        }}
                      >
                        {typeof body === 'string'
                          ? body
                          : JSON.stringify(body)}
                      </div>
                    </div>
                  )}

                  {!isExpanded && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        color="link"
                        onClick={() => toggleRowExpansion(logId)}
                        style={{ padding: 0, color: '#ff6b6b' }}
                      >
                        <ChevronDown size={16} className="me-1" />
                        Ver detalhes completos
                      </Button>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3">
                      <div className="mb-2">
                        <strong style={{ color: '#ff6b6b' }}>
                          Body Completo:
                        </strong>
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: '#ffffff',
                          backgroundColor: '#000000',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          maxHeight: '400px',
                          overflow: 'auto',
                        }}
                      >
                        {hasParsedData
                          ? JSON.stringify(body, null, 4)
                          : typeof body === 'string'
                          ? body
                          : JSON.stringify(body, null, 4)}
                      </pre>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          color="link"
                          onClick={() => toggleRowExpansion(logId)}
                          style={{ padding: 0, color: '#ff6b6b' }}
                        >
                          <ChevronUp size={16} className="me-1" />
                          Ocultar detalhes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="mt-2 d-flex gap-2">
                  <Button
                    size="sm"
                    color="link"
                    onClick={() => setSelectedLog(row)}
                    style={{ padding: 0 }}
                  >
                    Ver completo
                  </Button>
                  <Button
                    size="sm"
                    color="link"
                    onClick={() => copyToClipboard(row.message, logId)}
                    style={{ padding: 0 }}
                  >
                    {copiedLogId === logId ? (
                      <>
                        <Check size={16} className="me-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="me-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          }

          // Visualizador específico para Erro ao gerar PIX
          if (parsed.logType === 'pix_generation_error') {
            const body = parsed.pixErrorBody;
            const hasParsedData =
              body && typeof body === 'object' && !Array.isArray(body);
            return (
              <div>
                <div
                  style={{
                    backgroundColor: '#1e1e1e',
                    color: '#ffffff',
                    padding: '16px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                  }}
                >
                  <div className="mb-3">
                    <Badge
                      color="danger"
                      style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                    >
                      Erro ao gerar PIX
                    </Badge>
                    {parsed.pixErrorCode && (
                      <Badge
                        color="warning"
                        className="ms-2"
                        style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                      >
                        Código: {parsed.pixErrorCode}
                      </Badge>
                    )}
                    {parsed.pixErrorId && (
                      <Badge
                        color="secondary"
                        className="ms-2"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      >
                        ID: {parsed.pixErrorId}
                      </Badge>
                    )}
                  </div>

                  {parsed.pixErrorMessage && (
                    <div
                      className="mb-3"
                      style={{
                        padding: '12px',
                        backgroundColor: '#2d1b1b',
                        borderRadius: '4px',
                        border: '1px solid #dc3545',
                      }}
                    >
                      <strong style={{ color: '#ff6b6b' }}>
                        Mensagem de Erro:
                      </strong>
                      <div
                        style={{
                          marginTop: '4px',
                          color: '#ffffff',
                          fontWeight: 'bold',
                        }}
                      >
                        {parsed.pixErrorMessage}
                      </div>
                    </div>
                  )}

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong style={{ color: '#ff6b6b' }}>
                          Requisição:
                        </strong>
                        <div style={{ marginTop: '4px', paddingLeft: '12px' }}>
                          {parsed.pixErrorMethod && (
                            <div>
                              <strong>Method:</strong>{' '}
                              <Badge color="info">
                                {parsed.pixErrorMethod}
                              </Badge>
                            </div>
                          )}
                          {parsed.pixErrorUrl && (
                            <div
                              style={{
                                marginTop: '4px',
                                wordBreak: 'break-all',
                              }}
                            >
                              <strong>URL:</strong> {parsed.pixErrorUrl}
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                    {hasParsedData && body && (
                      <Col md={6}>
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>Oferta:</strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            {body.offer_id && (
                              <div>
                                <strong>ID:</strong> {body.offer_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    )}
                  </Row>

                  {hasParsedData && body && (
                    <>
                      {body.full_name && (
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>Cliente:</strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            <div>
                              <strong>Nome:</strong> {body.full_name}
                            </div>
                            {body.email && (
                              <div>
                                <strong>Email:</strong> {body.email}
                              </div>
                            )}
                            {body.document_number && (
                              <div>
                                <strong>CPF:</strong> {body.document_number}
                              </div>
                            )}
                            {body.whatsapp && (
                              <div>
                                <strong>WhatsApp:</strong> {body.whatsapp}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {body.address && (
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>
                            Endereço:
                          </strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            <div>
                              {body.address.street}, {body.address.number}
                              {body.address.complement &&
                                ` - ${body.address.complement}`}
                            </div>
                            <div>
                              {body.address.neighborhood} - {body.address.city}/
                              {body.address.state}
                            </div>
                            <div>CEP: {body.address.zipcode}</div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!hasParsedData && body && (
                    <div className="mb-3">
                      <strong style={{ color: '#ff6b6b' }}>
                        Body (não parseado):
                      </strong>
                      <div
                        style={{
                          marginTop: '4px',
                          padding: '12px',
                          backgroundColor: '#000000',
                          borderRadius: '4px',
                          color: '#ffffff',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxHeight: '200px',
                          overflow: 'auto',
                        }}
                      >
                        {typeof body === 'string' ? body : JSON.stringify(body)}
                      </div>
                    </div>
                  )}

                  {!isExpanded && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        color="link"
                        onClick={() => toggleRowExpansion(logId)}
                        style={{ padding: 0, color: '#ff6b6b' }}
                      >
                        <ChevronDown size={16} className="me-1" />
                        Ver detalhes completos
                      </Button>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3">
                      <div className="mb-2">
                        <strong style={{ color: '#ff6b6b' }}>
                          Body Completo:
                        </strong>
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: '#ffffff',
                          backgroundColor: '#000000',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          maxHeight: '400px',
                          overflow: 'auto',
                        }}
                      >
                        {hasParsedData
                          ? JSON.stringify(body, null, 4)
                          : typeof body === 'string'
                          ? body
                          : JSON.stringify(body, null, 4)}
                      </pre>
                      {parsed.pixErrorStack && (
                        <>
                          <div className="mb-2 mt-3">
                            <strong style={{ color: '#ff6b6b' }}>
                              Stack Trace:
                            </strong>
                          </div>
                          <pre
                            style={{
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              color: '#ffffff',
                              backgroundColor: '#000000',
                              padding: '12px',
                              borderRadius: '4px',
                              fontSize: '0.85rem',
                              fontWeight: 'bold',
                              maxHeight: '200px',
                              overflow: 'auto',
                            }}
                          >
                            {parsed.pixErrorStack}
                          </pre>
                        </>
                      )}
                      <div className="mt-2">
                        <Button
                          size="sm"
                          color="link"
                          onClick={() => toggleRowExpansion(logId)}
                          style={{ padding: 0, color: '#ff6b6b' }}
                        >
                          <ChevronUp size={16} className="me-1" />
                          Ocultar detalhes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="mt-2 d-flex gap-2">
                  <Button
                    size="sm"
                    color="link"
                    onClick={() => setSelectedLog(row)}
                    style={{ padding: 0 }}
                  >
                    Ver completo
                  </Button>
                  <Button
                    size="sm"
                    color="link"
                    onClick={() => copyToClipboard(row.message, logId)}
                    style={{ padding: 0 }}
                  >
                    {copiedLogId === logId ? (
                      <>
                        <Check size={16} className="me-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="me-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          }

          // Visualizador específico para PIX Sale Execution
          if (parsed.logType === 'pix_sale_execution' && parsed.pixSaleBody) {
            const body = parsed.pixSaleBody;
            return (
              <div>
                <div
                  style={{
                    backgroundColor: '#1e1e1e',
                    color: '#ffffff',
                    padding: '16px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                  }}
                >
                  <div className="mb-3">
                    <Badge
                      color="success"
                      style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                    >
                      PIX Sale Execution
                    </Badge>
                    {parsed.executionTime && (
                      <Badge
                        color="info"
                        className="ms-2"
                        style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                      >
                        Tempo: {parsed.executionTime}
                      </Badge>
                    )}
                  </div>

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong style={{ color: '#4CAF50' }}>Cliente:</strong>
                        <div style={{ marginTop: '4px', paddingLeft: '12px' }}>
                          <div>
                            <strong>Nome:</strong> {body.full_name || '-'}
                          </div>
                          <div>
                            <strong>Email:</strong> {body.email || '-'}
                          </div>
                          <div>
                            <strong>CPF:</strong> {body.document_number || '-'}
                          </div>
                          <div>
                            <strong>WhatsApp:</strong> {body.whatsapp || '-'}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong style={{ color: '#4CAF50' }}>Oferta:</strong>
                        <div style={{ marginTop: '4px', paddingLeft: '12px' }}>
                          <div>
                            <strong>ID:</strong> {body.offer_id || '-'}
                          </div>
                          {body.coupon && (
                            <div>
                              <strong>Cupom:</strong>{' '}
                              <Badge color="warning">{body.coupon}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>

                  {body.address && (
                    <div className="mb-3">
                      <strong style={{ color: '#4CAF50' }}>Endereço:</strong>
                      <div style={{ marginTop: '4px', paddingLeft: '12px' }}>
                        <div>
                          {body.address.street}, {body.address.number}
                          {body.address.complement &&
                            ` - ${body.address.complement}`}
                        </div>
                        <div>
                          {body.address.neighborhood} - {body.address.city}/
                          {body.address.state}
                        </div>
                        <div>CEP: {body.address.zipcode}</div>
                      </div>
                    </div>
                  )}

                  {body.params && (
                    <div className="mb-3">
                      <strong style={{ color: '#4CAF50' }}>
                        Parâmetros UTM:
                      </strong>
                      <div
                        style={{
                          marginTop: '4px',
                          paddingLeft: '12px',
                          fontSize: '0.85rem',
                        }}
                      >
                        {body.params.utm_source && (
                          <div>
                            <strong>Source:</strong> {body.params.utm_source}
                          </div>
                        )}
                        {body.params.utm_medium && (
                          <div>
                            <strong>Medium:</strong> {body.params.utm_medium}
                          </div>
                        )}
                        {body.params.utm_campaign && (
                          <div>
                            <strong>Campaign:</strong>{' '}
                            {body.params.utm_campaign}
                          </div>
                        )}
                        {body.params.utm_content && (
                          <div style={{ wordBreak: 'break-all' }}>
                            <strong>Content:</strong>{' '}
                            {body.params.utm_content.substring(0, 100)}...
                          </div>
                        )}
                        {body.params.utm_term && (
                          <div>
                            <strong>Term:</strong> {body.params.utm_term}
                          </div>
                        )}
                        {body.params.src && (
                          <div>
                            <strong>Source ID:</strong> {body.params.src}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!isExpanded && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        color="link"
                        onClick={() => toggleRowExpansion(logId)}
                        style={{ padding: 0, color: '#4CAF50' }}
                      >
                        <ChevronDown size={16} className="me-1" />
                        Ver detalhes completos
                      </Button>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="mt-3">
                      <div className="mb-2">
                        <strong style={{ color: '#4CAF50' }}>
                          JSON Completo:
                        </strong>
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: '#ffffff',
                          backgroundColor: '#000000',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          maxHeight: '400px',
                          overflow: 'auto',
                        }}
                      >
                        {JSON.stringify(body, null, 4)}
                      </pre>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          color="link"
                          onClick={() => toggleRowExpansion(logId)}
                          style={{ padding: 0, color: '#4CAF50' }}
                        >
                          <ChevronUp size={16} className="me-1" />
                          Ocultar detalhes
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botões de ação */}
                <div className="mt-2 d-flex gap-2">
                  <Button
                    size="sm"
                    color="link"
                    onClick={() => setSelectedLog(row)}
                    style={{ padding: 0 }}
                  >
                    Ver completo
                  </Button>
                  <Button
                    size="sm"
                    color="link"
                    onClick={() => copyToClipboard(row.message, logId)}
                    style={{ padding: 0 }}
                  >
                    {copiedLogId === logId ? (
                      <>
                        <Check size={16} className="me-1" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={16} className="me-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div>
              {/* Informações resumidas */}
              {parsed.error && (
                <div className="mb-2">
                  <Badge color="danger" className="me-2">
                    {parsed.errorType || 'Erro'}
                  </Badge>
                  <strong>Erro:</strong> {parsed.error}
                </div>
              )}
              {parsed.endpoint && (
                <div className="mb-2">
                  <Badge color="info" className="me-2">
                    Endpoint
                  </Badge>
                  {parsed.endpoint}
                </div>
              )}
              {parsed.offerName && (
                <div className="mb-2">
                  <Badge color="secondary" className="me-2">
                    Oferta
                  </Badge>
                  {parsed.offerName}
                  {parsed.offerId && (
                    <span className="text-muted ms-2">({parsed.offerId})</span>
                  )}
                </div>
              )}

              {/* Preview da mensagem */}
              <div
                style={{
                  maxHeight: isExpanded ? 'none' : '150px',
                  overflow: isExpanded ? 'visible' : 'auto',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  backgroundColor: '#1e1e1e',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  lineHeight: '1.5',
                }}
              >
                {parsed.prefix && (
                  <div style={{ marginBottom: '8px' }}>
                    <Badge color="danger" style={{ fontSize: '0.75rem' }}>
                      {parsed.prefix}
                    </Badge>
                  </div>
                )}
                {parsed.jsonData ? (
                  <pre
                    style={{
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: '#ffffff',
                      backgroundColor: 'transparent',
                      fontWeight: 'bold',
                    }}
                  >
                    {JSON.stringify(parsed.jsonData, null, 4)}
                  </pre>
                ) : (
                  <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
                    {isExpanded
                      ? parsed.rawMessage
                      : parsed.rawMessage.substring(0, previewLength) +
                        (parsed.rawMessage.length > previewLength ? '...' : '')}
                  </span>
                )}
              </div>

              {/* Botões de ação */}
              <div className="mt-2 d-flex gap-2">
                <Button
                  size="sm"
                  color="link"
                  onClick={() => toggleRowExpansion(logId)}
                  style={{ padding: 0 }}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={16} className="me-1" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} className="me-1" />
                      Ver mais
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  color="link"
                  onClick={() => setSelectedLog(row)}
                  style={{ padding: 0 }}
                >
                  Ver completo
                </Button>
                <Button
                  size="sm"
                  color="link"
                  onClick={() => copyToClipboard(row.message, logId)}
                  style={{ padding: 0 }}
                >
                  {copiedLogId === logId ? (
                    <>
                      <Check size={16} className="me-1" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="me-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        },
        wrap: true,
        minWidth: '400px',
      },
    ],
    [expandedRows, parseLogMessage, skin, copiedLogId, getLogId],
  );

  return (
    <section id="pageCloudWatchLogs">
      <h2 className="mb-2">Logs CloudWatch</h2>

      <Card className="mb-2">
        <CardHeader>
          <h5>Filtros</h5>
        </CardHeader>
        <CardBody>
          <Row>
            <Col md={3}>
              <Label for="hours">Horas (últimas)</Label>
              <Input
                type="number"
                id="hours"
                min="1"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                placeholder="Ex: 1"
              />
            </Col>
            <Col md={3}>
              <Label for="logGroup">Grupo de Logs</Label>
              <Input
                type="select"
                id="logGroup"
                value={logGroup}
                onChange={(e) => setLogGroup(e.target.value)}
              >
                {logGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={4}>
              <Label for="filterPattern">Padrão de Filtro</Label>
              <Input
                type="select"
                id="filterPattern"
                value={filterPattern}
                onChange={(e) => setFilterPattern(e.target.value)}
              >
                <option value="">Selecione um padrão</option>
                {patterns.map((pattern) => (
                  <option key={pattern} value={pattern}>
                    {pattern}
                  </option>
                ))}
              </Input>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button
                color="primary"
                onClick={fetchLogs}
                disabled={loading || !filterPattern}
                block
              >
                {loading ? 'Buscando...' : 'Buscar Logs'}
              </Button>
            </Col>
          </Row>
        </CardBody>
      </Card>

      {error && (
        <Alert color="danger" className="mb-2">
          {error}
        </Alert>
      )}

      {responseInfo.total !== undefined && (
        <Card className="mb-2">
          <CardBody>
            <Row>
              <Col md={3}>
                <strong>Total de logs:</strong> {responseInfo.total}
              </Col>
              <Col md={3}>
                <strong>Período:</strong>{' '}
                {responseInfo.startTime &&
                  moment(responseInfo.startTime).format('DD/MM/YYYY HH:mm')}
                {' - '}
                {responseInfo.endTime &&
                  moment(responseInfo.endTime).format('DD/MM/YYYY HH:mm')}
              </Col>
              <Col md={3}>
                <strong>Grupo:</strong> {responseInfo.logGroup}
              </Col>
              <Col md={3}>
                <strong>Padrão:</strong> {responseInfo.filterPattern}
              </Col>
            </Row>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody style={{ padding: '1rem', width: '100%' }}>
          <DataTable
            columns={columns}
            data={logs}
            progressPending={loading}
            noDataComponent="Nenhum log encontrado. Ajuste os filtros e tente novamente."
            pagination
            paginationPerPage={20}
            paginationRowsPerPageOptions={[10, 20, 50, 100]}
            theme={skin === 'dark' ? 'solarized' : 'solarizedLight'}
            dense
            paginationComponentOptions={{
              rowsPerPageText: 'Linhas por página:',
              rangeSeparatorText: 'de',
              noRowsPerPage: false,
            }}
            customStyles={{
              cells: {
                style: {
                  padding: '8px',
                },
              },
              headCells: {
                style: {
                  padding: '8px',
                },
              },
              table: {
                style: {
                  width: '100%',
                },
              },
              tableWrapper: {
                style: {
                  width: '100%',
                },
              },
            }}
          />
        </CardBody>
      </Card>

      {/* Modal para visualização completa */}
      <Modal
        isOpen={!!selectedLog}
        toggle={() => setSelectedLog(null)}
        size="lg"
      >
        <ModalHeader toggle={() => setSelectedLog(null)}>
          Detalhes do Log
        </ModalHeader>
        <ModalBody>
          {selectedLog &&
            (() => {
              const parsed = parseLogMessage(selectedLog.message);

              // Visualizador específico para Erro CARTÃO no modal
              if (parsed.logType === 'card_generation_error') {
                const body = parsed.cardErrorBody;
                const hasParsedData =
                  body && typeof body === 'object' && !Array.isArray(body);
                return (
                  <div>
                    <Row className="mb-3">
                      <Col md={6}>
                        <strong>Timestamp:</strong>
                        <br />
                        {moment(selectedLog.timestamp).format(
                          'DD/MM/YYYY HH:mm:ss',
                        )}
                      </Col>
                      <Col md={6}>
                        <strong>Log Stream:</strong>
                        <br />
                        <code>{selectedLog.logStreamName}</code>
                      </Col>
                    </Row>

                    <hr />

                    <div className="mb-3">
                      <Badge
                        color="danger"
                        style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                      >
                        Erro CARTÃO
                      </Badge>
                      {parsed.cardErrorCode && (
                        <Badge
                          color="warning"
                          className="ms-2"
                          style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                        >
                          Código: {parsed.cardErrorCode}
                        </Badge>
                      )}
                      {parsed.cardErrorId && (
                        <Badge
                          color="secondary"
                          className="ms-2"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          ID: {parsed.cardErrorId}
                        </Badge>
                      )}
                    </div>

                    {parsed.cardErrorMessage && (
                      <div
                        className="mb-3"
                        style={{
                          padding: '12px',
                          backgroundColor: '#2d1b1b',
                          borderRadius: '4px',
                          border: '1px solid #dc3545',
                        }}
                      >
                        <strong style={{ color: '#ff6b6b' }}>
                          Mensagem de Erro:
                        </strong>
                        <div
                          style={{
                            marginTop: '4px',
                            color: '#ffffff',
                            fontWeight: 'bold',
                          }}
                        >
                          {parsed.cardErrorMessage}
                        </div>
                      </div>
                    )}

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>
                            Requisição:
                          </strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            {parsed.cardErrorMethod && (
                              <div>
                                <strong>Method:</strong>{' '}
                                <Badge color="info">
                                  {parsed.cardErrorMethod}
                                </Badge>
                              </div>
                            )}
                            {parsed.cardErrorUrl && (
                              <div
                                style={{
                                  marginTop: '4px',
                                  wordBreak: 'break-all',
                                }}
                              >
                                <strong>URL:</strong> {parsed.cardErrorUrl}
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                      {hasParsedData && body && (
                        <Col md={6}>
                          <div className="mb-3">
                            <strong style={{ color: '#ff6b6b' }}>
                              Oferta:
                            </strong>
                            <div
                              style={{ marginTop: '4px', paddingLeft: '12px' }}
                            >
                              {body.offer_id && (
                                <div>
                                  <strong>ID:</strong> {body.offer_id}
                                </div>
                              )}
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>

                    {hasParsedData && body && (
                      <>
                        {body.full_name && (
                          <div className="mb-3">
                            <strong style={{ color: '#ff6b6b' }}>
                              Cliente:
                            </strong>
                            <div
                              style={{ marginTop: '4px', paddingLeft: '12px' }}
                            >
                              <div>
                                <strong>Nome:</strong> {body.full_name}
                              </div>
                              {body.email && (
                                <div>
                                  <strong>Email:</strong> {body.email}
                                </div>
                              )}
                              {body.document_number && (
                                <div>
                                  <strong>CPF:</strong> {body.document_number}
                                </div>
                              )}
                              {body.whatsapp && (
                                <div>
                                  <strong>WhatsApp:</strong> {body.whatsapp}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {body.card && (
                          <div className="mb-3">
                            <strong style={{ color: '#ff6b6b' }}>
                              Cartão:
                            </strong>
                            <div
                              style={{ marginTop: '4px', paddingLeft: '12px' }}
                            >
                              {body.card.card_holder && (
                                <div>
                                  <strong>Portador:</strong>{' '}
                                  {body.card.card_holder}
                                </div>
                              )}
                              {body.card.card_number && (
                                <div>
                                  <strong>Número:</strong>{' '}
                                  {body.card.card_number.substring(0, 4)} ****
                                  ****{' '}
                                  {body.card.card_number.substring(
                                    body.card.card_number.length - 4,
                                  )}
                                </div>
                              )}
                              {body.card.expiration_date && (
                                <div>
                                  <strong>Validade:</strong>{' '}
                                  {body.card.expiration_date}
                                </div>
                              )}
                              {body.card.installments && (
                                <div>
                                  <strong>Parcelas:</strong>{' '}
                                  {body.card.installments}x
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {body.address && (
                          <div className="mb-3">
                            <strong style={{ color: '#ff6b6b' }}>
                              Endereço:
                            </strong>
                            <div
                              style={{ marginTop: '4px', paddingLeft: '12px' }}
                            >
                              {body.address.street && (
                                <div>
                                  {body.address.street}
                                  {body.address.number &&
                                    `, ${body.address.number}`}
                                  {body.address.complement &&
                                    ` - ${body.address.complement}`}
                                </div>
                              )}
                              {body.address.neighborhood && (
                                <div>
                                  {body.address.neighborhood}
                                  {body.address.city &&
                                    ` - ${body.address.city}`}
                                  {body.address.state && `/${body.address.state}`}
                                </div>
                              )}
                              {body.address.zipcode && (
                                <div>CEP: {body.address.zipcode}</div>
                              )}
                              {!body.address.street && (
                                <div
                                  style={{
                                    color: '#ff6b6b',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  ⚠ Endereço incompleto
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {!hasParsedData && body && (
                      <div className="mb-3">
                        <strong style={{ color: '#ff6b6b' }}>
                          Body (não parseado):
                        </strong>
                        <div
                          style={{
                            marginTop: '4px',
                            padding: '12px',
                            backgroundColor: '#000000',
                            borderRadius: '4px',
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: '200px',
                            overflow: 'auto',
                          }}
                        >
                          {typeof body === 'string'
                            ? body
                            : JSON.stringify(body)}
                        </div>
                      </div>
                    )}

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Body Completo:</strong>
                      <Button
                        size="sm"
                        color="primary"
                        outline
                        onClick={() =>
                          copyToClipboard(
                            selectedLog.message,
                            getLogId(selectedLog),
                          )
                        }
                      >
                        {copiedLogId === getLogId(selectedLog) ? (
                          <>
                            <Check size={14} className="me-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="me-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>

                    <div
                      style={{
                        maxHeight: '400px',
                        overflow: 'auto',
                        backgroundColor: '#000000',
                        padding: '12px',
                        borderRadius: '4px',
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                          lineHeight: '1.6',
                          fontWeight: 'bold',
                        }}
                      >
                        {hasParsedData
                          ? JSON.stringify(body, null, 4)
                          : typeof body === 'string'
                          ? body
                          : JSON.stringify(body, null, 4)}
                      </pre>
                    </div>
                  </div>
                );
              }

              // Visualizador específico para Erro ao gerar PIX no modal
              if (parsed.logType === 'pix_generation_error') {
                const body = parsed.pixErrorBody;
                const hasParsedData =
                  body && typeof body === 'object' && !Array.isArray(body);
                return (
                  <div>
                    <Row className="mb-3">
                      <Col md={6}>
                        <strong>Timestamp:</strong>
                        <br />
                        {moment(selectedLog.timestamp).format(
                          'DD/MM/YYYY HH:mm:ss',
                        )}
                      </Col>
                      <Col md={6}>
                        <strong>Log Stream:</strong>
                        <br />
                        <code>{selectedLog.logStreamName}</code>
                      </Col>
                    </Row>

                    <hr />

                    <div className="mb-3">
                      <Badge
                        color="danger"
                        style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                      >
                        Erro ao gerar PIX
                      </Badge>
                      {parsed.pixErrorCode && (
                        <Badge
                          color="warning"
                          className="ms-2"
                          style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                        >
                          Código: {parsed.pixErrorCode}
                        </Badge>
                      )}
                      {parsed.pixErrorId && (
                        <Badge
                          color="secondary"
                          className="ms-2"
                          style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        >
                          ID: {parsed.pixErrorId}
                        </Badge>
                      )}
                    </div>

                    {parsed.pixErrorMessage && (
                      <div
                        className="mb-3"
                        style={{
                          padding: '12px',
                          backgroundColor: '#2d1b1b',
                          borderRadius: '4px',
                          border: '1px solid #dc3545',
                        }}
                      >
                        <strong style={{ color: '#ff6b6b' }}>
                          Mensagem de Erro:
                        </strong>
                        <div
                          style={{
                            marginTop: '4px',
                            color: '#ffffff',
                            fontWeight: 'bold',
                          }}
                        >
                          {parsed.pixErrorMessage}
                        </div>
                      </div>
                    )}

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong style={{ color: '#ff6b6b' }}>
                            Requisição:
                          </strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            {parsed.pixErrorMethod && (
                              <div>
                                <strong>Method:</strong>{' '}
                                <Badge color="info">
                                  {parsed.pixErrorMethod}
                                </Badge>
                              </div>
                            )}
                            {parsed.pixErrorUrl && (
                              <div
                                style={{
                                  marginTop: '4px',
                                  wordBreak: 'break-all',
                                }}
                              >
                                <strong>URL:</strong> {parsed.pixErrorUrl}
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                      {hasParsedData && body && (
                        <Col md={6}>
                          <div className="mb-3">
                            <strong style={{ color: '#ff6b6b' }}>
                              Oferta:
                            </strong>
                            <div
                              style={{ marginTop: '4px', paddingLeft: '12px' }}
                            >
                              {body.offer_id && (
                                <div>
                                  <strong>ID:</strong> {body.offer_id}
                                </div>
                              )}
                            </div>
                          </div>
                        </Col>
                      )}
                    </Row>

                    {hasParsedData && body && (
                      <>
                        {body.full_name && (
                          <div className="mb-3">
                            <strong style={{ color: '#ff6b6b' }}>
                              Cliente:
                            </strong>
                            <div
                              style={{ marginTop: '4px', paddingLeft: '12px' }}
                            >
                              <div>
                                <strong>Nome:</strong> {body.full_name}
                              </div>
                              {body.email && (
                                <div>
                                  <strong>Email:</strong> {body.email}
                                </div>
                              )}
                              {body.document_number && (
                                <div>
                                  <strong>CPF:</strong> {body.document_number}
                                </div>
                              )}
                              {body.whatsapp && (
                                <div>
                                  <strong>WhatsApp:</strong> {body.whatsapp}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {body.address && (
                          <div className="mb-3">
                            <strong style={{ color: '#ff6b6b' }}>
                              Endereço:
                            </strong>
                            <div
                              style={{ marginTop: '4px', paddingLeft: '12px' }}
                            >
                              <div>
                                {body.address.street}, {body.address.number}
                                {body.address.complement &&
                                  ` - ${body.address.complement}`}
                              </div>
                              <div>
                                {body.address.neighborhood} -{' '}
                                {body.address.city}/{body.address.state}
                              </div>
                              <div>CEP: {body.address.zipcode}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {!hasParsedData && body && (
                      <div className="mb-3">
                        <strong style={{ color: '#ff6b6b' }}>
                          Body (não parseado):
                        </strong>
                        <div
                          style={{
                            marginTop: '4px',
                            padding: '12px',
                            backgroundColor: '#000000',
                            borderRadius: '4px',
                            color: '#ffffff',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            maxHeight: '200px',
                            overflow: 'auto',
                          }}
                        >
                          {typeof body === 'string'
                            ? body
                            : JSON.stringify(body)}
                        </div>
                      </div>
                    )}

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Body Completo:</strong>
                      <Button
                        size="sm"
                        color="primary"
                        outline
                        onClick={() =>
                          copyToClipboard(
                            selectedLog.message,
                            getLogId(selectedLog),
                          )
                        }
                      >
                        {copiedLogId === getLogId(selectedLog) ? (
                          <>
                            <Check size={14} className="me-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="me-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>

                    <div
                      style={{
                        maxHeight: '400px',
                        overflow: 'auto',
                        backgroundColor: '#000000',
                        padding: '12px',
                        borderRadius: '4px',
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                          lineHeight: '1.6',
                          fontWeight: 'bold',
                        }}
                      >
                        {hasParsedData
                          ? JSON.stringify(body, null, 4)
                          : typeof body === 'string'
                          ? body
                          : JSON.stringify(body, null, 4)}
                      </pre>
                    </div>

                    {parsed.pixErrorStack && (
                      <>
                        <div className="mb-2 mt-3">
                          <strong style={{ color: '#ff6b6b' }}>
                            Stack Trace:
                          </strong>
                        </div>
                        <div
                          style={{
                            maxHeight: '200px',
                            overflow: 'auto',
                            backgroundColor: '#000000',
                            padding: '12px',
                            borderRadius: '4px',
                          }}
                        >
                          <pre
                            style={{
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                              color: '#ffffff',
                              backgroundColor: 'transparent',
                              lineHeight: '1.6',
                              fontWeight: 'bold',
                            }}
                          >
                            {parsed.pixErrorStack}
                          </pre>
                        </div>
                      </>
                    )}
                  </div>
                );
              }

              // Visualizador específico para PIX Sale Execution no modal
              if (
                parsed.logType === 'pix_sale_execution' &&
                parsed.pixSaleBody
              ) {
                const body = parsed.pixSaleBody;
                return (
                  <div>
                    <Row className="mb-3">
                      <Col md={6}>
                        <strong>Timestamp:</strong>
                        <br />
                        {moment(selectedLog.timestamp).format(
                          'DD/MM/YYYY HH:mm:ss',
                        )}
                      </Col>
                      <Col md={6}>
                        <strong>Log Stream:</strong>
                        <br />
                        <code>{selectedLog.logStreamName}</code>
                      </Col>
                    </Row>

                    <hr />

                    <div className="mb-3">
                      <Badge
                        color="success"
                        style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                      >
                        PIX Sale Execution
                      </Badge>
                      {parsed.executionTime && (
                        <Badge
                          color="info"
                          className="ms-2"
                          style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                        >
                          Tempo: {parsed.executionTime}
                        </Badge>
                      )}
                    </div>

                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong style={{ color: '#4CAF50' }}>Cliente:</strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            <div>
                              <strong>Nome:</strong> {body.full_name || '-'}
                            </div>
                            <div>
                              <strong>Email:</strong> {body.email || '-'}
                            </div>
                            <div>
                              <strong>CPF:</strong>{' '}
                              {body.document_number || '-'}
                            </div>
                            <div>
                              <strong>WhatsApp:</strong> {body.whatsapp || '-'}
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong style={{ color: '#4CAF50' }}>Oferta:</strong>
                          <div
                            style={{ marginTop: '4px', paddingLeft: '12px' }}
                          >
                            <div>
                              <strong>ID:</strong> {body.offer_id || '-'}
                            </div>
                            {body.coupon && (
                              <div>
                                <strong>Cupom:</strong>{' '}
                                <Badge color="warning">{body.coupon}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>

                    {body.address && (
                      <div className="mb-3">
                        <strong style={{ color: '#4CAF50' }}>Endereço:</strong>
                        <div style={{ marginTop: '4px', paddingLeft: '12px' }}>
                          <div>
                            {body.address.street}, {body.address.number}
                            {body.address.complement &&
                              ` - ${body.address.complement}`}
                          </div>
                          <div>
                            {body.address.neighborhood} - {body.address.city}/
                            {body.address.state}
                          </div>
                          <div>CEP: {body.address.zipcode}</div>
                        </div>
                      </div>
                    )}

                    {body.params && (
                      <div className="mb-3">
                        <strong style={{ color: '#4CAF50' }}>
                          Parâmetros UTM:
                        </strong>
                        <div
                          style={{
                            marginTop: '4px',
                            paddingLeft: '12px',
                            fontSize: '0.85rem',
                          }}
                        >
                          {body.params.utm_source && (
                            <div>
                              <strong>Source:</strong> {body.params.utm_source}
                            </div>
                          )}
                          {body.params.utm_medium && (
                            <div>
                              <strong>Medium:</strong> {body.params.utm_medium}
                            </div>
                          )}
                          {body.params.utm_campaign && (
                            <div>
                              <strong>Campaign:</strong>{' '}
                              {body.params.utm_campaign}
                            </div>
                          )}
                          {body.params.utm_content && (
                            <div style={{ wordBreak: 'break-all' }}>
                              <strong>Content:</strong>{' '}
                              {body.params.utm_content}
                            </div>
                          )}
                          {body.params.utm_term && (
                            <div>
                              <strong>Term:</strong> {body.params.utm_term}
                            </div>
                          )}
                          {body.params.src && (
                            <div>
                              <strong>Source ID:</strong> {body.params.src}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <hr />

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>JSON Completo:</strong>
                      <Button
                        size="sm"
                        color="primary"
                        outline
                        onClick={() =>
                          copyToClipboard(
                            selectedLog.message,
                            getLogId(selectedLog),
                          )
                        }
                      >
                        {copiedLogId === getLogId(selectedLog) ? (
                          <>
                            <Check size={14} className="me-1" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="me-1" />
                            Copiar
                          </>
                        )}
                      </Button>
                    </div>

                    <div
                      style={{
                        maxHeight: '400px',
                        overflow: 'auto',
                        backgroundColor: '#000000',
                        padding: '12px',
                        borderRadius: '4px',
                      }}
                    >
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                          lineHeight: '1.6',
                          fontWeight: 'bold',
                        }}
                      >
                        {JSON.stringify(body, null, 4)}
                      </pre>
                    </div>
                  </div>
                );
              }

              // Visualização padrão para outros tipos
              return (
                <div>
                  <Row className="mb-3">
                    <Col md={6}>
                      <strong>Timestamp:</strong>
                      <br />
                      {moment(selectedLog.timestamp).format(
                        'DD/MM/YYYY HH:mm:ss',
                      )}
                    </Col>
                    <Col md={6}>
                      <strong>Log Stream:</strong>
                      <br />
                      <code>{selectedLog.logStreamName}</code>
                    </Col>
                  </Row>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <strong>Mensagem Completa:</strong>
                    <Button
                      size="sm"
                      color="primary"
                      outline
                      onClick={() =>
                        copyToClipboard(
                          selectedLog.message,
                          getLogId(selectedLog),
                        )
                      }
                    >
                      {copiedLogId === getLogId(selectedLog) ? (
                        <>
                          <Check size={14} className="me-1" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy size={14} className="me-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>

                  <div
                    style={{
                      maxHeight: '500px',
                      overflow: 'auto',
                      backgroundColor: '#1e1e1e',
                      padding: '16px',
                      borderRadius: '4px',
                      border: '1px solid #444',
                    }}
                  >
                    {parsed.jsonData ? (
                      <div>
                        {parsed.prefix && (
                          <div style={{ marginBottom: '12px' }}>
                            <Badge
                              color="danger"
                              style={{ fontSize: '0.85rem' }}
                            >
                              {parsed.prefix}
                            </Badge>
                          </div>
                        )}
                        <pre
                          style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            color: '#ffffff',
                            backgroundColor: 'transparent',
                            lineHeight: '1.6',
                            fontWeight: 'bold',
                          }}
                        >
                          {JSON.stringify(parsed.jsonData, null, 4)}
                        </pre>
                      </div>
                    ) : (
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'monospace',
                          fontSize: '0.9rem',
                          color: '#ffffff',
                          backgroundColor: 'transparent',
                          lineHeight: '1.6',
                          fontWeight: 'bold',
                        }}
                      >
                        {selectedLog.message}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })()}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setSelectedLog(null)}>
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </section>
  );
};

export default CloudWatchLogs;
