import { SetMetadata } from '@nestjs/common';
import { RoleEnum } from 'src/enum/role.enum';
export const HasRoles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);