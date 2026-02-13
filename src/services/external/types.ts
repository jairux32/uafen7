export type ComplianceSource = 'UAFE' | 'OFAC' | 'ONU' | 'INTERPOL';

export type ComplianceStatus = 'CLEAN' | 'MATCH' | 'ERROR';

export interface ComplianceMatch {
    source: ComplianceSource;
    name: string;
    percentage: number; // 0-100 match confidence
    details: string;
    date?: string;
    referenceId?: string;
}

export interface ComplianceCheckResult {
    source: ComplianceSource;
    status: ComplianceStatus;
    matches: ComplianceMatch[];
    timestamp: Date;
    executionTimeMs: number;
    error?: string;
}

export interface IComplianceProvider {
    source: ComplianceSource;
    checkPerson(identificacion: string, nombre: string): Promise<ComplianceCheckResult>;
}
