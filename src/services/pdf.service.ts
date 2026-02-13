
import PDFDocument from 'pdfkit';

export class PdfService {
    async generateOperacionReport(operacion: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // --- Header ---
                doc.font('Helvetica-Bold').fontSize(20).text('Reporte de Operación', { align: 'center' });
                doc.moveDown();
                doc.fontSize(12).font('Helvetica').text(`ID Operación: ${operacion.id}`, { align: 'right' });
                doc.text(`Fecha de Reporte: ${new Date().toLocaleDateString()}`, { align: 'right' });
                doc.moveDown();

                // --- Información General ---
                doc.font('Helvetica-Bold').fontSize(14).text('Información General');
                doc.moveDown(0.5);
                this.generateRow(doc, 'Tipo de Acto:', operacion.tipoActo);
                this.generateRow(doc, 'Fecha Escritura:', new Date(operacion.fechaEscritura).toLocaleDateString());
                this.generateRow(doc, 'Valor Declarado:', `$${operacion.valorDeclarado}`);
                this.generateRow(doc, 'Forma de Pago:', operacion.formaPago);
                if (operacion.montoEfectivo) {
                    this.generateRow(doc, 'Monto Efectivo:', `$${operacion.montoEfectivo}`);
                }
                this.generateRow(doc, 'Número Escritura:', operacion.numeroEscritura);
                doc.moveDown();

                // --- Evaluación de Riesgo ---
                doc.font('Helvetica-Bold').fontSize(14).text('Evaluación de Riesgo');
                doc.moveDown(0.5);
                this.generateRow(doc, 'Nivel de Riesgo:', operacion.nivelRiesgo);
                this.generateRow(doc, 'Score de Riesgo:', operacion.scoreRiesgo?.toString() || 'N/A');
                this.generateRow(doc, 'Tipo Debida Diligencia:', operacion.tipoDD || 'N/A');
                doc.moveDown();

                // --- Vendedor ---
                if (operacion.vendedor) {
                    doc.font('Helvetica-Bold').fontSize(14).text('Vendedor / Cedente');
                    doc.moveDown(0.5);
                    const v = operacion.vendedor;
                    this.generateRow(doc, 'Nombre/Razón Social:', v.nombres ? `${v.nombres} ${v.apellidos || ''}` : v.razonSocial);
                    this.generateRow(doc, 'Identificación:', v.identificacion);
                    this.generateRow(doc, 'Nacionalidad:', v.nacionalidad);
                    this.generateRow(doc, 'PEP:', v.esPEP ? 'SÍ' : 'NO');
                    doc.moveDown();
                }

                // --- Comprador ---
                if (operacion.comprador) {
                    doc.font('Helvetica-Bold').fontSize(14).text('Comprador / Cesionario');
                    doc.moveDown(0.5);
                    const c = operacion.comprador;
                    this.generateRow(doc, 'Nombre/Razón Social:', c.nombres ? `${c.nombres} ${c.apellidos || ''}` : c.razonSocial);
                    this.generateRow(doc, 'Identificación:', c.identificacion);
                    this.generateRow(doc, 'Nacionalidad:', c.nacionalidad);
                    this.generateRow(doc, 'PEP:', c.esPEP ? 'SÍ' : 'NO');
                    doc.moveDown();
                }

                // --- Footer ---
                const bottom = doc.page.height - 50;
                doc.fontSize(10).text('Generado por Sistema de Cumplimiento VSinnfo', 50, bottom, { align: 'center', width: doc.page.width - 100 });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    private generateRow(doc: PDFKit.PDFDocument, label: string, value: string) {
        doc.font('Helvetica-Bold').fontSize(10).text(label, { continued: true });
        doc.font('Helvetica').text(` ${value || 'N/A'}`);
    }

    async generateKYCForm(operacion: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50, size: 'A4' });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // --- Header ---
                doc.font('Helvetica-Bold').fontSize(14).text('POLÍTICA "CONOZCA A SU CLIENTE NOTARÍA SÉPTIMA DEL CANTÓN LOJA"', { align: 'center' });
                doc.moveDown();

                // --- Datos Generales ---
                doc.rect(50, doc.y, 500, 60).stroke();
                const startY = doc.y + 10;
                doc.fontSize(9);
                doc.text(`Número de Protocolo: ${operacion.numeroEscritura || '_______'}`, 60, startY);
                doc.text(`Acto Notarial: ${operacion.tipoActo}`, 300, startY);
                doc.text(`Fecha: ${new Date(operacion.fechaEscritura).toLocaleDateString()}`, 60, startY + 15);
                doc.text(`Monto Transacción: $${operacion.valorDeclarado}`, 300, startY + 15);
                doc.text(`Avalúo Municipal: $${operacion.avaluoMunicipal || '_______'}`, 60, startY + 30);
                doc.text(`Forma de Pago: ${operacion.formaPago}`, 300, startY + 30);

                doc.y = startY + 50;
                doc.moveDown();

                // --- Vendedor ---
                this.renderKYCPersona(doc, 'VENDEDOR', operacion.vendedor);

                // --- Comprador ---
                this.renderKYCPersona(doc, 'COMPRADOR', operacion.comprador);

                // --- Cónyuge (si existe) ---
                if (operacion.comprador?.nombreConyuge) {
                    this.renderKYCConyuge(doc, operacion.comprador);
                }

                // --- Declaración ---
                doc.moveDown();
                doc.font('Helvetica-Bold').fontSize(10).text('4. DECLARACIÓN DE ORIGEN Y LICITUD DE FONDOS');
                doc.font('Helvetica').fontSize(8).text(
                    'Conocedor(a) de las penas de perjurio declaro bajo juramento que la información arriba indicada es correcta, verdadera y actualizada, entiendo que la misma será leída/revisada por las autoridades competentes quienes la podrán considerar para todos los efectos legales que consideren necesarios. Autorizo a la notaría 7 del cantón Loja a realizar el análisis y verificaciones que consideren pertinentes a través de los medios necesarios, e informar de manera inmediata y documentada a la autoridad competente cuando se detectare algo inusual o transacciones sospechosas. Garantizo la veracidad de la información proporcionada y me abstengo de ejecutar cualquier acción tanto en el ámbito civil como penal por estos hechos, acogiéndome a sanciones que por información falsa establezcan las leyes ecuatorianas. Además, declaro que todos los recursos de la transacción que se ejecute son de origen y propósito lícito.',
                    { align: 'justify' }
                );

                // --- Firmas ---
                doc.moveDown(4);
                const firmaY = doc.y;
                doc.lineCap('butt').moveTo(60, firmaY).lineTo(200, firmaY).stroke();
                doc.lineCap('butt').moveTo(300, firmaY).lineTo(440, firmaY).stroke();

                doc.fontSize(8).text('VENDEDOR / CEDENTE', 60, firmaY + 5, { width: 140, align: 'center' });
                doc.text('COMPRADOR / CESIONARIO', 300, firmaY + 5, { width: 140, align: 'center' });

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    private renderKYCPersona(doc: PDFKit.PDFDocument, titulo: string, persona: any) {
        if (!persona) return;
        doc.font('Helvetica-Bold').fontSize(10).text(`INFORMACIÓN DEL ${titulo}`, { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(8).font('Helvetica');

        const labels = [
            ['Nombre/Razón Social:', persona.nombres ? `${persona.nombres} ${persona.apellidos || ''}` : persona.razonSocial],
            ['CI/RUC:', persona.identificacion],
            ['Nacionalidad:', persona.nacionalidad],
            ['Dirección:', persona.direccion],
            ['Parroquia/Cantón:', `${persona.parroquia || ''} / ${persona.canton || ''}`],
            ['Teléfono:', persona.telefono],
            ['Email:', persona.email],
            ['Actividad Económica:', persona.actividadEconomica || persona.profesion],
            ['PEP:', persona.esPEP ? 'SÍ' : 'NO'],
            ['Ingresos Mensuales:', `$${persona.ingresosMensuales || '0.00'}`]
        ];

        labels.forEach(([label, value]) => {
            doc.font('Helvetica-Bold').text(label, { continued: true });
            doc.font('Helvetica').text(` ${value || 'N/A'}`);
        });
        doc.moveDown();
    }

    private renderKYCConyuge(doc: PDFKit.PDFDocument, comprador: any) {
        doc.font('Helvetica-Bold').fontSize(10).text('INFORMACIÓN DEL CÓNYUGE DEL COMPRADOR', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(8).font('Helvetica');

        doc.font('Helvetica-Bold').text('Nombre:', { continued: true });
        doc.font('Helvetica').text(` ${comprador.nombreConyuge}`);
        doc.font('Helvetica-Bold').text('CI:', { continued: true });
        doc.font('Helvetica').text(` ${comprador.identificacionConyuge || 'N/A'}`);
        doc.moveDown();
    }
}

export const pdfService = new PdfService();
