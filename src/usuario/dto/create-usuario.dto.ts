import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nombre_usuario: string;

  @IsString()
  @IsNotEmpty()
  contrasena_usuario: string;

  @IsNumber()
  id_rol: number;
}