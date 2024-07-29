import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawBody = createParamDecorator(async (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.rawBody;
})