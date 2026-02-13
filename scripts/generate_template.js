const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

async function generateTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Migracion');

    worksheet.columns = [
        { header: 'Identificación', key: 'id' },
        { header: 'Nombres', key: 'nombres' },
        { header: 'Apellidos', key: 'apellidos' },
        { header: 'Tipo Persona (NATURAL/JURIDICA)', key: 'tipo' },
        { header: 'Fecha Nacimiento (YYYY-MM-DD)', key: 'nacimiento' },
        { header: 'Nacionalidad', key: 'nacionalidad' },
        { header: 'Dirección', key: 'direccion' },
        { header: 'Parroquia', key: 'parroquia' },
        { header: 'Cantón', key: 'canton' },
        { header: 'Provincia', key: 'provincia' },
        { header: 'Teléfono', key: 'telefono' },
        { header: 'Email', key: 'email' },
        { header: 'Actividad Económica', key: 'actividad' },
        { header: 'Es PEP (SI/NO)', key: 'pep' },
        { header: 'Ingresos Mensuales', key: 'ingresos' },
        { header: 'Estado Civil', key: 'civil' },
        { header: 'Nombre Cónyuge', key: 'conyuge_nombre' },
        { header: 'ID Contraparte', key: 'contraparte_id' },
        { header: 'Tipo Acto', key: 'acto' },
        { header: 'Número Escritura', key: 'escritura' },
        { header: 'Fecha Escritura (YYYY-MM-DD)', key: 'fecha' },
        { header: 'Valor Declarado', key: 'valor' },
        { header: 'Avalúo Municipal', key: 'avaluo' },
        { header: 'Forma Pago', key: 'pago' }
    ];

    // Add example row
    worksheet.addRow({
        id: '1712345678',
        nombres: 'JUAN',
        apellidos: 'PEREZ',
        tipo: 'NATURAL',
        nacimiento: '1985-05-20',
        nacionalidad: 'ECUATORIANA',
        direccion: 'AV. AMAZONAS',
        parroquia: 'EL SAGRARIO',
        canton: 'LOJA',
        provincia: 'LOJA',
        telefono: '0998887766',
        email: 'j@p.com',
        actividad: 'ARQUITECTO',
        pep: 'NO',
        ingresos: 2500.50,
        civil: 'CASADO',
        conyuge_nombre: 'MARIA LOPEZ',
        contraparte_id: '1104445556',
        acto: 'COMPRAVENTA',
        escritura: '2023-001-L',
        fecha: '2023-01-15',
        valor: 45000.00,
        avaluo: 42000.00,
        pago: 'TRANSFERENCIA'
    });

    const publicDir = path.join(__dirname, 'frontend', 'public', 'templates');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, 'migration_template.xlsx');
    await workbook.xlsx.writeFile(filePath);
    console.log('Template created at:', filePath);
}

generateTemplate().catch(console.error);
