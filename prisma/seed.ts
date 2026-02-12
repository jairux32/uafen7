import { PrismaClient } from '@prisma/client';
import { encryptionService } from '../src/utils/encryption';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create Notaría
    const notaria = await prisma.notaria.upsert({
        where: { ruc: '1791234567001' },
        update: {},
        create: {
            nombre: 'Notaría Primera de Quito',
            ruc: '1791234567001',
            direccion: 'Av. 10 de Agosto N24-12, Quito',
            telefono: '02-2234567',
            email: 'contacto@notaria.com',
            tamano: 'MEDIANA',
            numeroNotaria: '001',
            canton: 'Quito',
            provincia: 'Pichincha',
        },
    });

    console.log('✅ Notaría created:', notaria.nombre);

    // Create Users
    const adminPassword = await encryptionService.hashPassword('admin123');
    const oficialPassword = await encryptionService.hashPassword('oficial123');
    const notarioPassword = await encryptionService.hashPassword('notario123');

    const adminUser = await prisma.usuario.upsert({
        where: { email: 'admin@notaria.com' },
        update: {},
        create: {
            nombres: 'Admin',
            apellidos: 'Sistema',
            cedula: '1234567890',
            email: 'admin@notaria.com',
            password: adminPassword,
            rol: 'ADMIN_SISTEMA',
            notariaId: notaria.id,
        },
    });

    const oficialUser = await prisma.usuario.upsert({
        where: { email: 'oficial@notaria.com' },
        update: {},
        create: {
            nombres: 'María',
            apellidos: 'López',
            cedula: '0987654321',
            email: 'oficial@notaria.com',
            password: oficialPassword,
            rol: 'OFICIAL_CUMPLIMIENTO',
            notariaId: notaria.id,
        },
    });

    const notarioUser = await prisma.usuario.upsert({
        where: { email: 'notario@notaria.com' },
        update: {},
        create: {
            nombres: 'Dr. Juan',
            apellidos: 'Pérez González',
            cedula: '1122334455',
            email: 'notario@notaria.com',
            password: notarioPassword,
            rol: 'NOTARIO',
            notariaId: notaria.id,
        },
    });

    console.log('✅ Users created:');
    console.log('  - Admin:', adminUser.email, '(password: admin123)');
    console.log('  - Oficial:', oficialUser.email, '(password: oficial123)');
    console.log('  - Notario:', notarioUser.email, '(password: notario123)');

    console.log('\n🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
