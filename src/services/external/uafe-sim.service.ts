import { IComplianceProvider, ComplianceCheckResult, ComplianceSource } from './types';
import logger from '../../config/logger';

export class UafeSimService implements IComplianceProvider {
    readonly source: ComplianceSource = 'UAFE';

    async checkPerson(identificacion: string, nombre: string): Promise<ComplianceCheckResult> {
        const startTime = Date.now();

        // Simulate network latency (1.5s - 3s) typical for govt portals
        const delay = Math.floor(Math.random() * 1500) + 1500;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Logic for Simulation Triggers
        // Trigger: ID contains '666' -> MATCH
        // Trigger: ID contains '999' -> ERROR (Simulate service down)
        // Default: CLEAN

        let result: ComplianceCheckResult = {
            source: this.source,
            status: 'CLEAN',
            matches: [],
            timestamp: new Date(),
            executionTimeMs: Date.now() - startTime
        };

        if (identificacion.includes('666')) {
            logger.warn(`[UAFE-SIM] Match detected for ${identificacion}`);
            result.status = 'MATCH';
            result.matches.push({
                source: 'UAFE',
                name: nombre.toUpperCase(),
                percentage: 100,
                details: 'REPORTADO EN SISTEMA DE CUMPLIMIENTO (SIMULACION) - REQUIERE ROS',
                referenceId: `UAFE-${identificacion}-${Date.now()}`
            });
        } else if (identificacion.includes('999')) {
            logger.error(`[UAFE-SIM] Service simulation error for ${identificacion}`);
            result.status = 'ERROR';
            result.error = 'UAFE Service Timeout / Connection Refused (SIMULATED)';
        }

        logger.info(`[UAFE-SIM] Check completed for ${identificacion} in ${result.executionTimeMs}ms. Status: ${result.status}`);
        return result;
    }
}
