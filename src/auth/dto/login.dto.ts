import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  nombre_usuario: string;

  @IsString()
  @IsNotEmpty()
  contrasena_usuario: string;
}