import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessEnum } from 'src/enum/access.enum';
import { RoleEnum } from 'src/enum/role.enum';

@Injectable()
export class AccessGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredAccess = this.reflector.getAllAndOverride<AccessEnum[]>('access', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredAccess) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return user?.role == RoleEnum.ADMIN || user?.role == RoleEnum.TRADER || user?.role == RoleEnum.PROVIDER || user.access.some((access) => requiredAccess.indexOf(access) > -1);
    }
}