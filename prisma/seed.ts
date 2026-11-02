import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { TODOS_LOS_PERMISOS, type Permiso } from '../src/common/permisos.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env['DATABASE_URL']! }),
});

const prefijos =
  (...modulos: string[]) =>
  (p: Permiso) =>
    modulos.some((m) => p.startsWith(`${m}:`));

const ROLES: Record<
  string,
  { descripcion: string; incluye: (p: Permiso) => boolean }
> = {
  Administrador: { descripcion: 'Acceso total al sistema', incluye: () => true },
  Gerente: {
    descripcion: 'Supervisión y gestión del hotel',
    incluye: (p) =>
      p.endsWith(':ver') || prefijos('reserva', 'pago', 'factura', 'empleado')(p),
  },
  Recepcionista: {
    descripcion: 'Atención al cliente, reservas y pagos',
    incluye: (p) =>
      prefijos('huesped', 'reserva', 'check-in', 'check-out')(p) ||
      [
        'habitacion:ver',
        'tarifa:ver',
        'tipo-habitacion:ver',
        'estado-habitacion:ver',
        'estado-reserva:ver',
        'metodo-pago:ver',
        'pago:crear',
        'pago:ver',
        'factura:crear',
        'factura:ver',
      ].includes(p),
  },
  Mantenimiento: {
    descripcion: 'Mantenimiento de habitaciones',
    incluye: (p) =>
      prefijos('mantenimiento')(p) ||
      [
        'habitacion:ver',
        'historial-habitacion:ver',
        'historial-habitacion:crear',
      ].includes(p),
  },
};

async function seedSeguridad() {
  await prisma.permiso.createMany({
    data: TODOS_LOS_PERMISOS.map((nombre_permiso) => ({
      nombre_permiso,
      descripcion: `Permiso ${nombre_permiso}`,
    })),
    skipDuplicates: true,
  });
  const permisos = await prisma.permiso.findMany();

  for (const [nombre_rol, { descripcion, incluye }] of Object.entries(ROLES)) {
    const rol = await prisma.rol.upsert({
      where: { nombre_rol },
      update: {},
      create: { nombre_rol, descripcion },
    });
    await prisma.rolPermiso.createMany({
      data: permisos
        .filter((p) => incluye(p.nombre_permiso as Permiso))
        .map((p) => ({ id_rol: rol.id_rol, id_permiso: p.id_permiso })),
      skipDuplicates: true,
    });
  }

  // Contraseña de prueba encriptada. Cambiarla en cualquier entorno real.
  const hash = await bcrypt.hash(
    process.env['SEED_ADMIN_PASSWORD'] ?? 'Admin12345*',
    10,
  );
  const usuarios = [
    ['admin', 'Administrador'],
    ['gerente', 'Gerente'],
    ['recepcion', 'Recepcionista'],
    ['mantenimiento', 'Mantenimiento'],
  ];
  for (const [nombre_usuario, nombre_rol] of usuarios) {
    const rol = await prisma.rol.findUniqueOrThrow({ where: { nombre_rol } });
    await prisma.usuario.upsert({
      where: { nombre_usuario },
      update: {},
      create: { nombre_usuario, contrasena_usuario: hash, id_rol: rol.id_rol },
    });
  }
}

async function seedPersonal() {
  if ((await prisma.cargo.count()) === 0) {
    await prisma.cargo.createMany({
      data: [
        { nombre_car: 'Gerente General', sueldo_base: 60000 },
        { nombre_car: 'Recepcionista', sueldo_base: 25000 },
        { nombre_car: 'Personal de Mantenimiento', sueldo_base: 22000 },
      ],
    });
  }
  if ((await prisma.empleado.count()) === 0) {
    const cargos = await prisma.cargo.findMany();
    const cargo = (nombre: string) =>
      cargos.find((c) => c.nombre_car === nombre)!.id_cargo;
    await prisma.empleado.createMany({
      data: [
        {
          nombre_em: 'Ana',
          apellido_em: 'Rodríguez',
          cedula_em: '00100000001',
          fecha_nac_emp: new Date('1988-03-15'),
          sexo: true,
          id_cargo: cargo('Gerente General'),
          fecha_ingreso: new Date('2022-01-10'),
          salario_actual: 60000,
          correo_em: 'ana@hotelrea.com',
        },
        {
          nombre_em: 'Luis',
          apellido_em: 'Pérez',
          cedula_em: '00100000002',
          fecha_nac_emp: new Date('1995-07-21'),
          sexo: false,
          id_cargo: cargo('Recepcionista'),
          fecha_ingreso: new Date('2023-05-02'),
          salario_actual: 25000,
          correo_em: 'luis@hotelrea.com',
        },
        {
          nombre_em: 'Carlos',
          apellido_em: 'Mejía',
          cedula_em: '00100000003',
          fecha_nac_emp: new Date('1992-11-02'),
          sexo: false,
          id_cargo: cargo('Personal de Mantenimiento'),
          fecha_ingreso: new Date('2023-08-15'),
          salario_actual: 22000,
          correo_em: 'carlos@hotelrea.com',
        },
      ],
    });
  }
}

async function seedHabitaciones() {
  if ((await prisma.estadoHabitacion.count()) === 0) {
    await prisma.estadoHabitacion.createMany({
      data: ['Disponible', 'Ocupada', 'Limpieza', 'Mantenimiento'].map(
        (nombre_estado) => ({ nombre_estado }),
      ),
    });
  }
  if ((await prisma.tipoHabitacion.count()) === 0) {
    await prisma.tipoHabitacion.createMany({
      data: [
        { nombre_tipo: 'Sencilla', capacidad: 1, cantidad_camas: 1 },
        { nombre_tipo: 'Doble', capacidad: 2, cantidad_camas: 2 },
        { nombre_tipo: 'Suite', capacidad: 4, cantidad_camas: 2 },
      ],
    });
  }
  if ((await prisma.habitacion.count()) === 0) {
    const tipos = await prisma.tipoHabitacion.findMany();
    const tipo = (n: string) =>
      tipos.find((t) => t.nombre_tipo === n)!.id_thabitacion;
    const disponible = await prisma.estadoHabitacion.findFirstOrThrow({
      where: { nombre_estado: 'Disponible' },
    });
    const filas = [
      ['101', 1, 'Sencilla'],
      ['102', 1, 'Doble'],
      ['103', 1, 'Doble'],
      ['201', 2, 'Suite'],
      ['202', 2, 'Suite'],
    ] as const;
    await prisma.habitacion.createMany({
      data: filas.map(([numero_habitacion, piso, t]) => ({
        numero_habitacion,
        piso,
        id_tipo: tipo(t),
        id_est_habitacion: disponible.id_est_habitacion,
      })),
    });
  }
  if ((await prisma.tarifa.count()) === 0) {
    const tipos = await prisma.tipoHabitacion.findMany();
    const precios: Record<string, number> = {
      Sencilla: 2500,
      Doble: 3500,
      Suite: 6500,
    };
    await prisma.tarifa.createMany({
      data: tipos.map((t) => ({
        id_thabitacion: t.id_thabitacion,
        nombre_temporada: 'Temporada regular',
        fecha_inicio: new Date('2026-01-01'),
        fecha_fin: new Date('2026-12-31'),
        precio_noche: precios[t.nombre_tipo] ?? 3000,
      })),
    });
  }
}

async function seedReservasYPagos() {
  if ((await prisma.estadoReserva.count()) === 0) {
    await prisma.estadoReserva.createMany({
      data: ['Pendiente', 'Confirmada', 'Cancelada', 'Finalizada'].map(
        (nombre_est_res) => ({ nombre_est_res }),
      ),
    });
  }
  if ((await prisma.metodoPago.count()) === 0) {
    await prisma.metodoPago.createMany({
      data: ['Efectivo', 'Tarjeta Débito', 'Tarjeta Crédito', 'Transferencia'].map(
        (nombre_metodo) => ({ nombre_metodo }),
      ),
    });
  }
}

async function seedHuespedes() {
  // 25 huéspedes para probar la paginación (10 por página = 3 páginas)
  const nombres = ['María', 'Juan', 'Carmen', 'Pedro', 'Luisa'];
  const apellidos = ['Santana', 'Reyes', 'Fernández', 'Cabrera', 'Medina'];
  await prisma.huesped.createMany({
    data: Array.from({ length: 25 }, (_, i) => ({
      nombre_hu: nombres[i % 5]!,
      apellido_hu: `${apellidos[Math.floor(i / 5)]} ${i + 1}`,
      identificacion_hu: `001-${String(1000000 + i)}-${i % 10}`,
      correo_hu: `huesped${i + 1}@correo.com`,
      nacionalidad_hu: 'Dominicana',
    })),
    skipDuplicates: true,
  });
}

async function main() {
  await seedSeguridad();
  await seedPersonal();
  await seedHabitaciones();
  await seedReservasYPagos();
  await seedHuespedes();
  console.log('Seed completado');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });