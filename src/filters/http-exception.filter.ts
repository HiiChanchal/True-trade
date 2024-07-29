import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { MongoErrorCodeEnum } from 'src/enum/mongo-error.enum';

@Catch()
export class AppExceptionsFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }
    catch(exception: any, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: any;
        // console.log(exception)
        if (exception instanceof HttpException) {
            httpStatus = exception.getStatus();
            const response: any = exception?.getResponse();
            message = response.message;
        }
        else {
            httpStatus = HttpStatus.BAD_REQUEST;
            switch (exception.code) {
                case MongoErrorCodeEnum.DuplicateKey: {
                    message = "You are trying to add duplicate records.";
                    break;
                }
                default: {
                    message = exception instanceof Error ? exception.message : exception?.message?.error;
                }
            }
        }
        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: message || 'Sorry we are experiencing some technical problems.',
        };
        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}