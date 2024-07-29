import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ISocket } from 'src/interface/user.interface';
import { AppConfigService } from './config.service';

@Injectable()
export class SocketService {
    private readonly userSession: Map<String, ISocket> = new Map();
    private readonly adminSession: Map<String, ISocket> = new Map();
    constructor(private apiConfigService: AppConfigService, private jwtService: JwtService) { }
    async verify(token: any) {
        try {
            return this.jwtService.verify(token, { secret: this.apiConfigService.jwtSecret });
        } catch (err) {
            return null
        }
    }
    getUserSocket(userId: string) {
        return this.userSession.get(userId);
    }
    setUserSocket(userId: string, socket: ISocket) {
        this.userSession.set(userId, socket);
    }
    removeUserSocket(userId: string) {
        this.userSession.delete(userId);
    }
    getAdminUserSocket(userId: string) {
        return this.adminSession.get(userId);
    }
    setAdminUserSocket(userId: string, socket: ISocket) {
        this.adminSession.set(userId, socket);
    }
    removeAdminUserSocket(userId: string) {
        this.adminSession.delete(userId);
    }
    getAllAdminSockets(): Map<String, ISocket> {
        return this.adminSession;
    }
    getAllUserSockets(): Map<String, ISocket> {
        return this.userSession;
    }
}