import { DateTime } from 'luxon';
import { IndicatorResult } from '../indicators/types';

export interface CsvColumn {
    header: string;
    value: (indicator: IndicatorResult) => string;
}

export const defaultColumns: CsvColumn[] = [
    {
        header: 'Timestamp',
        value: (indicator) => DateTime.fromMillis(parseInt(indicator.timestamp))
            .toFormat("yyyy-MM-dd HH:mm:ss.SSS")
    },
    {
        header: 'Symbol',
        value: (indicator) => indicator.symbol
    }
];

export function formatCsvHeader(columns: CsvColumn[]): string {
    return columns.map(col => col.header).join(',') + '\n';
}

function getIndicatorValue(indicator: IndicatorResult, header: string): string {
    // 映射 CSV 列名到指標值名稱
    const valueMap: { [key: string]: string } = {
        'VWAP Bid USD': 'vwapBid',
        'VWAP Ask USD': 'vwapAsk',
        'Spread %': 'spreadPct',
        'Bid Volume USD': 'bidVolume',
        'Ask Volume USD': 'askVolume'
    };

    const valueName = valueMap[header];
    if (valueName && indicator.values[valueName as keyof typeof indicator.values] !== undefined) {
        return indicator.values[valueName as keyof typeof indicator.values].toString();
    }
    return '';
}

export function formatCsvLine(
    indicators: IndicatorResult[],
    columns: CsvColumn[]
): string {
    return columns.map(col => {
        // 使用第一個指標的基本信息
        if (col.header === 'Timestamp' || col.header === 'Symbol') {
            return col.value(indicators[0]);
        }
        
        // 在所有指標中尋找對應的值
        for (const indicator of indicators) {
            const value = getIndicatorValue(indicator, col.header);
            if (value) {
                return value;
            }
        }
        return '';
    }).join(',') + '\n';
} 