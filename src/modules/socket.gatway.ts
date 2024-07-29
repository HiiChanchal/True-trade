import { OnEvent } from '@nestjs/event-emitter';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { WsException } from '@nestjs/websockets/errors';
import { Server } from 'socket.io';
import { InquiryEventEnum, PaymentEventEnum, ProfileEventEnum, SignalEventEnum, TransactionEventEnum,  } from 'src/enum/event.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { ISocket } from 'src/interface/user.interface';
import { SocketService } from 'src/services/socket.service';

@WebSocketGateway({
    transports: ['websocket'],
    cors: {
        origin: '*'
    },
    pingInterval: 10000,
    pingTimeout: 15000,
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() wss: Server;

    constructor(private socketService: SocketService) {
    }

    afterInit(server: Server): void {
    }

    async handleDisconnect(client: ISocket) {
        const user: any = await this.socketService.verify(
            client.handshake.query.token
        );
        if (!user) {
            client.disconnect(true);
        }
        if ([RoleEnum.ADMIN].includes(user.role)) {
            this.socketService.removeAdminUserSocket(user.authId.toString());
        }
        if ([RoleEnum.TRADER, RoleEnum.PROVIDER].includes(user.role)) {
            this.socketService.removeUserSocket(user.authId.toString());
        }
    }

    async handleConnection(client: ISocket) {
        const user: any = await this.socketService.verify(
            client.handshake.query.token
        );
        if (!user) {
            client._error(new WsException("invalid token"))
            client.disconnect(true);
        }
        client.user = user;
        if ([RoleEnum.ADMIN].includes(user.role)) {
            this.socketService.setAdminUserSocket(user.authId.toString(), client);
        }
        if ([RoleEnum.TRADER, RoleEnum.PROVIDER].includes(user.role)) {
            this.socketService.setUserSocket(user.authId.toString(), client);
        }
    }

    //signal event
    @OnEvent(SignalEventEnum.CREATED)
    handleSignalCreatedEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(SignalEventEnum.CREATED, payload);
        }
    }
    @OnEvent(SignalEventEnum.UPDATED)
    handleSignalUpdatedEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(SignalEventEnum.UPDATED, payload);
        }
    }
    @OnEvent(SignalEventEnum.COMMENT)
    handleSignalCommentEvent(payload: any) {
        this.socketService.getAllUserSockets().forEach((client: ISocket) => {
            client.emit(SignalEventEnum.COMMENT, payload);
        });
    }

    //payment event
    @OnEvent(PaymentEventEnum.ACCEPTED)
    handlePaymentSuccessEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(PaymentEventEnum.ACCEPTED, { success: true });
        }
    }
    @OnEvent(PaymentEventEnum.REJECTED)
    handlePaymentRejectEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(PaymentEventEnum.REJECTED, { success: true });
        }
    }

    //inquiry event
    @OnEvent(InquiryEventEnum.CREATED)
    handleCreateInquiryEvent(payload: any) {
        this.socketService.getAllAdminSockets().forEach((client: ISocket) => {
            client.emit(InquiryEventEnum.CREATED, payload);
        });
    }

    @OnEvent(InquiryEventEnum.UPDATED)
    handleUpdateInquiryEvent(payload: any) {
        if ([RoleEnum.ADMIN].includes(payload.role)) {
            let _socket = this.socketService.getUserSocket(payload.user.toString());
            if (_socket) {
                _socket.emit(InquiryEventEnum.UPDATED, { inquiryId: payload.inquiryId, thread: payload.thread });
            }
        }
        else {
            this.socketService.getAllAdminSockets().forEach((client: ISocket) => {
                client.emit(InquiryEventEnum.UPDATED, { inquiryId: payload.inquiryId, thread: payload.thread });
            });
        }
    }
    @OnEvent(InquiryEventEnum.CLOSED)
    handleCloseInquiryEvent(payload: any) {
        if ([RoleEnum.ADMIN].includes(payload.role)) {
            let _socket = this.socketService.getUserSocket(payload.user.toString());
            if (_socket) {
                _socket.emit(InquiryEventEnum.CLOSED, { inquiryId: payload.inquiryId, title: payload.title });
            }
        }
        else {
            this.socketService.getAllAdminSockets().forEach((client: ISocket) => {
                client.emit(InquiryEventEnum.CLOSED, { inquiryId: payload.inquiryId, title: payload.title });
            });
        }
    }
    //profile status
    @OnEvent(ProfileEventEnum.STATUS)
    handleProfileStatusEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(ProfileEventEnum.STATUS, { status: payload.status });
        }
    }
    //Transaction status
    @OnEvent(TransactionEventEnum.STATUS)
    handleTransactionStatusEvent(payload: any) {
        let _socket = this.socketService.getUserSocket(payload.user.toString());
        if (_socket) {
            _socket.emit(TransactionEventEnum.STATUS, { status: payload.status });
        }
    }   
}