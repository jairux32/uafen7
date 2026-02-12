import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestPersons() {
    console.log('Creating test persons for wizard testing...');

    // Test person 1 - Vendedor
    const vendedor = await prisma.debiDaDiligencia.upsert({
        where: { identificacion: '1234567890' },
        update: {},
        create: {
            tipo: 'ESTANDAR',
            tipoPersona: 'NATURAL',
            identificacion: '1234567890',
            cedula: '1234567890',
            nombres: 'Juan Carlos',
            apellidos: 'Pérez González',
            nacionalidad: 'Ecuatoriana',
            paisConstitucion: 'Ecuador',
            direccion: 'Av. 10 de Agosto y Colón, Quito',
            telefono: '0998765432',
            ingresosMensuales: 2500.00,
            origenFondos: 'Salario como empleado en empresa privada',
            esPEP: false,
            actividadEconomica: 'Empleado',
            fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
        },
    });

    // Test person 2 - Comprador
    const comprador = await prisma.debiDaDiligencia.upsert({
        where: { identificacion: '0987654321' },
        update: {},
        create: {
            tipo: 'ESTANDAR',
            tipoPersona: 'NATURAL',
            identificacion: '0987654321',
            cedula: '0987654321',
            nombres: 'María Fernanda',
            apellidos: 'López Martínez',
            nacionalidad: 'Ecuatoriana',
            paisConstitucion: 'Ecuador',
            direccion: 'Calle García Moreno 123, Quito',
            telefono: '0987654321',
            ingresosMensuales: 3500.00,
            origenFondos: 'Negocio propio - comercio',
            esPEP: false,
            actividadEconomica: 'Comerciante',
            fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
    });

    // Test person 3 - PEP
    const pep = await prisma.debiDaDiligencia.upsert({
        where: { identificacion: '1666666666' },
        update: {},
        create: {
            tipo: 'REFORZADA',
            tipoPersona: 'NATURAL',
            identificacion: '1666666666',
            cedula: '1666666666',
            nombres: 'Roberto',
            apellidos: 'Sánchez Díaz',
            nacionalidad: 'Ecuatoriana',
            paisConstitucion: 'Ecuador',
            direccion: 'Av. Amazonas N24-03, Quito',
            telefono: '0999888777',
            ingresosMensuales: 8000.00,
            origenFondos: 'Cargo público',
            esPEP: true,
            actividadEconomica: 'Funcionario Público',
            fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
    });

    // Test person 4 - Juridica
    const juridica = await prisma.debiDaDiligencia.upsert({
        where: { identificacion: '1790123456001' },
        update: {},
        create: {
            tipo: 'ESTANDAR',
            tipoPersona: 'JURIDICA',
            identificacion: '1790123456001',
            rucEmpresa: '1790123456001',
            razonSocial: 'Constructora ABC S.A.',
            nacionalidad: 'Ecuatoriana',
            paisConstitucion: 'Ecuador',
            direccion: 'Av. Naciones Unidas E10-43, Quito',
            telefono: '022345678',
            ingresosMensuales: 50000.00,
            origenFondos: 'Actividad comercial - construcción',
            esPEP: false,
            actividadEconomica: 'Construcción',
            fechaExpiracion: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
    });

    console.log('✅ Test persons created:');
    console.log('  - Vendedor:', vendedor.identificacion, '-', vendedor.nombres, vendedor.apellidos);
    console.log('  - Comprador:', comprador.identificacion, '-', comprador.nombres, comprador.apellidos);
    console.log('  - PEP:', pep.identificacion, '-', pep.nombres, pep.apellidos);
    console.log('  - Jurídica:', juridica.identificacion, '-', juridica.razonSocial);
}

createTestPersons()
    .catch((e) => {
        console.error('❌ Error creating test persons:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
