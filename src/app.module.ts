import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { HuespedModule } from './huesped/huesped.module.js';
import { PermisoModule } from './permiso/permiso.module.js';
import { RolModule } from './rol/rol.module.js';
import { UsuarioModule } from './usuario/usuario.module.js';
import { BitacoraModule } from './bitacora/bitacora.module.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, HuespedModule, PermisoModule, RolModule, UsuarioModule, BitacoraModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}