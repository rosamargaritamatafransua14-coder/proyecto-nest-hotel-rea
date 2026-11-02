import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { RolService } from './rol.service.js';
import { CreateRolDto } from './dto/create-rol.dto.js';
import { UpdateRolDto } from './dto/update-rol.dto.js';

@Controller('rol')
export class RolController {
  constructor(private readonly rolService: RolService) {}

  @Post()
  create(@Body() dto: CreateRolDto) { return this.rolService.create(dto); }

  @Get()
  findAll() { return this.rolService.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.rolService.findOne(id); }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRolDto) { return this.rolService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.rolService.remove(id); }
}