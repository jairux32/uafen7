import { IComplianceProvider, ComplianceCheckResult, ComplianceSource } from './types';
import logger from '../../config/logger';

export class UnSimService implements IComplianceProvider {
    readonly source: ComplianceSource = 'ONU';

    async checkPerson(_identificacion: string, nombre: string): Promise<ComplianceCheckResult> {
        const startTime = Date.now();

        // Similar to OFAC
        const delay = Math.floor(Math.random() * 400) + 100;
        await new Promise(resolve => setTimeout(resolve, delay));

        let result: ComplianceCheckResult = {
            source: this.source,
            status: 'CLEAN',
            matches: [],
            timestamp: new Date(),
            executionTimeMs: Date.now() - startTime
        };

        // Trigger: Name contains 'TERROR'
        if (nombre.toUpperCase().includes('TERROR')) {
            logger.warn(`[ONU-SIM] Match detected for ${nombre}`);
            result.status = 'MATCH';
            result.matches.push({
                source: 'ONU',
                name: nombre.toUpperCase(),
                percentage: 99,
                details: 'UN Security Council Consolidated List Match',
                referenceId: `UN-${Date.now()}`
            });
        }

        logger.info(`[ONU-SIM] Check completed for ${nombre} in ${result.executionTimeMs}ms. Status: ${result.status}`);
        return result;
    }
}
