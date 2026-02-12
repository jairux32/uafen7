import { riskAssessmentService } from '../../src/services/riskAssessment.service';
import { TipoActo, TipoPersona, TipoDD, NivelRiesgo } from '@prisma/client';

describe('RiskAssessmentService', () => {
    describe('evaluarTipoDD', () => {
        it('should return SIMPLIFICADA for low-risk operation', async () => {
            const operacion = {
                tipoActo: TipoActo.LIQUIDACION_SOCIEDAD_CONYUGAL,
                valorDeclarado: 50000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const tipo = await riskAssessmentService.evaluarTipoDD(operacion);
            expect(tipo).toBe(TipoDD.SIMPLIFICADA);
        });

        it('should return ESTANDAR for medium-risk operation', async () => {
            const operacion = {
                tipoActo: TipoActo.HIPOTECA,
                valorDeclarado: 80000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const tipo = await riskAssessmentService.evaluarTipoDD(operacion);
            expect(tipo).toBe(TipoDD.ESTANDAR);
        });

        it('should return REFORZADA for foreign company', async () => {
            const operacion = {
                tipoActo: TipoActo.COMPRAVENTA,
                valorDeclarado: 150000,
                vendedor: {
                    tipoPersona: TipoPersona.JURIDICA,
                    paisConstitucion: 'Panama',
                    esPEP: false,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const tipo = await riskAssessmentService.evaluarTipoDD(operacion);
            expect(tipo).toBe(TipoDD.REFORZADA);
        });

        it('should return INTENSIFICADA for PEP involvement', async () => {
            const operacion = {
                tipoActo: TipoActo.COMPRAVENTA,
                valorDeclarado: 100000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: true,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const tipo = await riskAssessmentService.evaluarTipoDD(operacion);
            expect(tipo).toBe(TipoDD.INTENSIFICADA);
        });
    });

    describe('calcularScoreRiesgo', () => {
        it('should calculate low score for simple operation', async () => {
            const operacion = {
                tipoActo: TipoActo.CANCELACION_HIPOTECA,
                valorDeclarado: 30000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const score = await riskAssessmentService.calcularScoreRiesgo(operacion);
            expect(score).toBeLessThan(30);
        });

        it('should calculate high score for cash payment >= $10,000', async () => {
            const operacion = {
                tipoActo: TipoActo.COMPRAVENTA,
                valorDeclarado: 150000,
                montoEfectivo: 12000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const score = await riskAssessmentService.calcularScoreRiesgo(operacion);
            expect(score).toBeGreaterThanOrEqual(45); // 15 (compraventa) + 30 (efectivo)
        });

        it('should calculate very high score for PEP + high value', async () => {
            const operacion = {
                tipoActo: TipoActo.COMPRAVENTA,
                valorDeclarado: 200000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: true,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const score = await riskAssessmentService.calcularScoreRiesgo(operacion);
            expect(score).toBeGreaterThanOrEqual(70); // PEP (40) + compraventa (15) + alto valor (15)
        });

        it('should not exceed 100', async () => {
            const operacion = {
                tipoActo: TipoActo.COMPRAVENTA,
                valorDeclarado: 500000,
                montoEfectivo: 15000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: true,
                },
                comprador: {
                    tipoPersona: TipoPersona.JURIDICA,
                    paisConstitucion: 'Panama',
                    esPEP: true,
                },
            };

            const score = await riskAssessmentService.calcularScoreRiesgo(operacion);
            expect(score).toBeLessThanOrEqual(100);
        });
    });

    describe('identificarFactoresRiesgo', () => {
        it('should identify cash payment risk factor', async () => {
            const operacion = {
                tipoActo: TipoActo.COMPRAVENTA,
                valorDeclarado: 100000,
                montoEfectivo: 11000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const factores = await riskAssessmentService.identificarFactoresRiesgo(operacion);

            const cashFactor = factores.find((f) => f.tipo === 'EFECTIVO_ALTO');
            expect(cashFactor).toBeDefined();
            expect(cashFactor?.peso).toBe(30);
        });

        it('should identify PEP risk factors', async () => {
            const operacion = {
                tipoActo: TipoActo.COMPRAVENTA,
                valorDeclarado: 100000,
                vendedor: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: true,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: true,
                },
            };

            const factores = await riskAssessmentService.identificarFactoresRiesgo(operacion);

            const pepFactors = factores.filter((f) => f.tipo.includes('PEP'));
            expect(pepFactors).toHaveLength(2); // vendedor y comprador
            expect(pepFactors[0].peso).toBe(40);
        });

        it('should identify foreign company risk', async () => {
            const operacion = {
                tipoActo: TipoActo.COMPRAVENTA,
                valorDeclarado: 100000,
                vendedor: {
                    tipoPersona: TipoPersona.JURIDICA,
                    paisConstitucion: 'USA',
                    esPEP: false,
                },
                comprador: {
                    tipoPersona: TipoPersona.NATURAL,
                    esPEP: false,
                },
            };

            const factores = await riskAssessmentService.identificarFactoresRiesgo(operacion);

            const foreignFactor = factores.find((f) => f.tipo === 'EMPRESA_EXTRANJERA_VENDEDOR');
            expect(foreignFactor).toBeDefined();
            expect(foreignFactor?.peso).toBe(25);
        });
    });

    describe('determinarNivelRiesgo', () => {
        it('should return BAJO for score < 30', () => {
            expect(riskAssessmentService.determinarNivelRiesgo(15)).toBe(NivelRiesgo.BAJO);
            expect(riskAssessmentService.determinarNivelRiesgo(29)).toBe(NivelRiesgo.BAJO);
        });

        it('should return MEDIO for score 30-49', () => {
            expect(riskAssessmentService.determinarNivelRiesgo(30)).toBe(NivelRiesgo.MEDIO);
            expect(riskAssessmentService.determinarNivelRiesgo(45)).toBe(NivelRiesgo.MEDIO);
            expect(riskAssessmentService.determinarNivelRiesgo(49)).toBe(NivelRiesgo.MEDIO);
        });

        it('should return ALTO for score 50-69', () => {
            expect(riskAssessmentService.determinarNivelRiesgo(50)).toBe(NivelRiesgo.ALTO);
            expect(riskAssessmentService.determinarNivelRiesgo(60)).toBe(NivelRiesgo.ALTO);
            expect(riskAssessmentService.determinarNivelRiesgo(69)).toBe(NivelRiesgo.ALTO);
        });

        it('should return MUY_ALTO for score >= 70', () => {
            expect(riskAssessmentService.determinarNivelRiesgo(70)).toBe(NivelRiesgo.MUY_ALTO);
            expect(riskAssessmentService.determinarNivelRiesgo(85)).toBe(NivelRiesgo.MUY_ALTO);
            expect(riskAssessmentService.determinarNivelRiesgo(100)).toBe(NivelRiesgo.MUY_ALTO);
        });
    });
});
