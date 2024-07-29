import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AUTH_SCHEMA, COMMUNICATION_SCHEMA, NOTIFICATION_SCHEMA } from "src/Schema";
import { CommunicationController } from "./communication.controller";
import { CommunicationService } from "src/services/communication.service";
import { SendMailService } from "src/services/sendmail.service";
import { FirebaseService } from "src/services/firebase.service";

@Module({
    imports: [
        MongooseModule.forFeature([AUTH_SCHEMA, COMMUNICATION_SCHEMA, NOTIFICATION_SCHEMA])
    ],
    controllers: [CommunicationController],
    providers: [CommunicationService, SendMailService, FirebaseService],
    exports: []
})

export class AppCommunicationModule { }