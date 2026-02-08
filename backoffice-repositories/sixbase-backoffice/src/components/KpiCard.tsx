import React from 'react';
import Flatpickr from 'react-flatpickr';
import { Calendar } from 'react-feather';
import { Card, CardBody, Table } from 'reactstrap';
import moment from 'moment';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import LoadingSpinner from './LoadingSpinner';

interface StatValue {
    label: string;
    value: number | string;
    color?: string;
}

interface KpiCardProps {
    title: string;
    range: Date[];
    setRange: (date: Date[]) => void;
    stats: StatValue[];
    loading?: boolean;
    valueFormat?: 'currency' | 'integer' | 'float';
}

export const KpiCard: React.FC<KpiCardProps> = ({
    title,
    range,
    setRange,
    stats,
    loading = false,
    valueFormat = 'float',
}) => {
    const formatValue = (value: number | string): string => {
        if (typeof value === 'string') return value;
        if (valueFormat === 'currency')
            return value.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
                maximumFractionDigits: 2,
            });
        if (valueFormat === 'integer')
            return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
        return value.toFixed(1);
    };

    return (
        <Card className="h-100">
            <CardBody className="d-flex flex-column gap-1">
                <div className="d-flex justify-content-between align-items-center mb-50">
                    <h6 className="mb-0">{title}</h6>
                    <div className="d-flex align-items-center" style={{ gap: 6 }}>
                        <Calendar size={14} />
                        <Flatpickr
                            className="form-control form-control-sm bg-transparent border-0 shadow-none"
                            style={{ width: '180px' }}
                            placeholder="Selecionar período"
                            value={range}
                            onChange={(date: Date[]) => setRange(date)}
                            options={{ mode: 'range', dateFormat: 'd/m/Y', locale: Portuguese }}
                        />
                    </div>
                </div>
                <Table className="table-sm mb-0">
                    <tbody>
                        {stats.map((s, i) => (
                            <tr key={i}>
                                <td className="pl-0">{s.label}</td>
                                <td
                                    className="text-right pr-0"
                                    style={{ color: s.color || 'inherit' }}
                                >
                                    {loading ? <LoadingSpinner /> : formatValue(s.value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </CardBody>
        </Card>
    );
};