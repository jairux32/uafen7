import { UafeSimService } from './external/uafe-sim.service';
import { OfacSimService } from './external/ofac-sim.service';
import { UnSimService } from './external/un-sim.service';
import { ComplianceCheckResult } from './external/types';
import { redisClient } from '../config/database';
import logger from '../config/logger';

export class ComplianceService {
    private providers = [
        new UafeSimService(),
        new OfacSimService(),
        new UnSimService()
    ];

    async checkPerson(identificacion: string, nombre: string): Promise<Record<string, ComplianceCheckResult>> {
        const cacheKey = `compliance:check:${identificacion}`;

        // 1. Check Cache
        try {
            const cached = await redisClient.get(cacheKey);
            if (cached) {
                logger.info(`[Compliance] Cache hit for ${identificacion}`);
                return JSON.parse(cached);
            }
        } catch (error) {
            logger.error('[Compliance] Cache error', error);
        }

        // 2. Call Providers in Parallel
        logger.info(`[Compliance] Starting checks for ${identificacion} - ${nombre}`);
        const results = await Promise.all(
            this.providers.map(p => p.checkPerson(identificacion, nombre).catch(err => {
                logger.error(`[Compliance] Provider ${p.source} failed`, err);
                return {
                    source: p.source,
                    status: 'ERROR',
                    matches: [],
                    timestamp: new Date(),
                    executionTimeMs: 0,
                    error: err.message
                } as ComplianceCheckResult;
            }))
        );

        // 3. Aggregate Results
        const response: Record<string, ComplianceCheckResult> = {};
        results.forEach(r => response[r.source.toLowerCase()] = r);

        // 4. Save to Cache (24h TTL)
        try {
            await redisClient.setEx(cacheKey, 86400, JSON.stringify(response));
        } catch (error) {
            logger.error('[Compliance] Cache save error', error);
        }

        return response;
    }
}

export const complianceService = new ComplianceService();
