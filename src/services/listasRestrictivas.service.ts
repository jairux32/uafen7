import logger from '../config/logger';

interface ListaResult {
    lista: 'UAFE' | 'OFAC' | 'ONU';
    estado: 'limpio' | 'coincidencia';
    mensaje?: string;
    detalles?: any;
}

interface VerificacionResult {
    identificacion: string;
    nombre: string;
    resultados: ListaResult[];
}

/**
 * Listas Restrictivas Service
 * Handles verification against sanctions lists (UAFE, OFAC, ONU)
 * 
 * NOTE: This is a MOCK implementation for development.
 * In production, integrate with real APIs:
 * - UAFE: https://www.uafe.gob.ec
 * - OFAC: https://sanctionssearch.ofac.treas.gov/
 * - ONU: https://www.un.org/securitycouncil/sanctions/1267/aq_sanctions_list
 */
export class ListasRestrictivasService {
    /**
     * Verify person against all restrictive lists
     */
    async verificarPersona(identificacion: string, nombre: string): Promise<VerificacionResult> {
        logger.info(`Verifying person against restrictive lists: ${identificacion}`);

        const resultados: ListaResult[] = [];

        // Verify against each list
        resultados.push(await this.verificarUAFE(identificacion, nombre));
        resultados.push(await this.verificarOFAC(identificacion, nombre));
        resultados.push(await this.verificarONU(identificacion, nombre));

        return {
            identificacion,
            nombre,
            resultados,
        };
    }

    /**
     * Verify against UAFE (Unidad de Análisis Financiero y Económico - Ecuador)
     * MOCK: Always returns clean
     */
    private async verificarUAFE(identificacion: string, nombre: string): Promise<ListaResult> {
        // Simulate API delay
        await this.delay(500);

        // Mock: Check if identification contains '666' for testing
        if (identificacion.includes('666')) {
            return {
                lista: 'UAFE',
                estado: 'coincidencia',
                mensaje: 'Coincidencia encontrada en lista UAFE',
                detalles: {
                    razon: 'Persona reportada por actividades sospechosas',
                },
            };
        }

        return {
            lista: 'UAFE',
            estado: 'limpio',
            mensaje: 'Sin coincidencias en UAFE',
        };
    }

    /**
     * Verify against OFAC (Office of Foreign Assets Control - USA)
     * MOCK: Always returns clean
     */
    private async verificarOFAC(identificacion: string, nombre: string): Promise<ListaResult> {
        // Simulate API delay
        await this.delay(800);

        // Mock: Check if name contains 'SANCTION' for testing
        if (nombre.toUpperCase().includes('SANCTION')) {
            return {
                lista: 'OFAC',
                estado: 'coincidencia',
                mensaje: 'Coincidencia encontrada en lista OFAC',
                detalles: {
                    razon: 'Persona en lista de sanciones internacionales',
                },
            };
        }

        return {
            lista: 'OFAC',
            estado: 'limpio',
            mensaje: 'Sin coincidencias en OFAC',
        };
    }

    /**
     * Verify against UN Sanctions List
     * MOCK: Always returns clean
     */
    private async verificarONU(identificacion: string, nombre: string): Promise<ListaResult> {
        // Simulate API delay
        await this.delay(600);

        // Mock: Always clean for now
        return {
            lista: 'ONU',
            estado: 'limpio',
            mensaje: 'Sin coincidencias en lista ONU',
        };
    }

    /**
     * Helper: Simulate async delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const listasRestrictivasService = new ListasRestrictivasService();
