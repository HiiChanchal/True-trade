import { SetMetadata } from '@nestjs/common';
import { AccessEnum } from 'src/enum/access.enum';
export const HasAccess = (...access: AccessEnum[]) => SetMetadata('access', access);