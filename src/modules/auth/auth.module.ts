import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ADMIN_SCHEMA, AUTH_SCHEMA, AVATAR_SCHEMA, LOGIN_SCHEMA, TEMP_AUTH_SCHEMA, USER_SCHEMA } from 'src/Schema';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from 'src/services/auth.service';
import { AppConfigService } from 'src/services/config.service';
import { JwtStrategy } from 'src/services/strategy/jwt.strategy';
import { LocalStrategy } from 'src/services/strategy/local.strategy';
import { SendMailService } from 'src/services/sendmail.service';
import { SocketGateway } from '../socket.gatway';
import { SocketService } from 'src/services/socket.service';
import { GoogleService } from 'src/services/google.service';
import { AppleService } from 'src/services/apple.service';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [HttpModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET')
            }),
            inject: [ConfigService]
        }),
        MongooseModule.forFeature([AUTH_SCHEMA, TEMP_AUTH_SCHEMA, USER_SCHEMA, ADMIN_SCHEMA, LOGIN_SCHEMA, AVATAR_SCHEMA])],
    controllers: [AuthController],
    providers: [AuthService, AppConfigService, JwtStrategy, LocalStrategy, SendMailService, SocketService, SocketGateway, GoogleService, AppleService],
    exports: []
})
export class AppAuthModule { }