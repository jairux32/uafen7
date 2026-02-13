import { IComplianceProvider, ComplianceCheckResult, ComplianceSource } from './types';
import logger from '../../config/logger';

export class OfacSimService implements IComplianceProvider {
    readonly source: ComplianceSource = 'OFAC';

    async checkPerson(_identificacion: string, nombre: string): Promise<ComplianceCheckResult> {
        const startTime = Date.now();

        // Faster than UAFE, typically static list lookup (100ms - 500ms)
        const delay = Math.floor(Math.random() * 400) + 100;
        await new Promise(resolve => setTimeout(resolve, delay));

        let result: ComplianceCheckResult = {
            source: this.source,
            status: 'CLEAN',
            matches: [],
            timestamp: new Date(),
            executionTimeMs: Date.now() - startTime
        };

        // Trigger: Name contains 'SANCTION' or 'LADEN'
        if (nombre.toUpperCase().includes('SANCTION') || nombre.toUpperCase().includes('LADEN')) {
            logger.warn(`[OFAC-SIM] Match detected for ${nombre}`);
            result.status = 'MATCH';
            result.matches.push({
                source: 'OFAC',
                name: nombre.toUpperCase(),
                percentage: 95,
                details: 'SDN List Match - Specially Designated National',
                referenceId: `OFAC-${Date.now()}`
            });
        }

        logger.info(`[OFAC-SIM] Check completed for ${nombre} in ${result.executionTimeMs}ms. Status: ${result.status}`);
        return result;
    }
}
