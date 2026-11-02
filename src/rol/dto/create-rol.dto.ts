import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  permisosIds?: number[];
}