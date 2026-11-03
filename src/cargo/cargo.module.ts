import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CargoController } from './cargo.controller.js';
import { CargoService } from './cargo.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [CargoController],
  providers: [CargoService],
})
export class CargoModule {}