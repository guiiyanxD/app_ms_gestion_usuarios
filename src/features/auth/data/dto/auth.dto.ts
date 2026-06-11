export interface LoginResponseDto {
  readonly id: string;
  readonly token: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
}

export interface CatalogoUsuarioDto {
  readonly id: string;
  readonly nombre: string;
  readonly email: string;
  readonly rol: string;
  readonly area_id: number;
}

export interface CatalogoUsuariosResponseDto {
  readonly success: boolean;
  readonly data: readonly CatalogoUsuarioDto[];
}
