import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AUTH_SCHEMA, CATEGORY_SCHEMA, NOTIFICATION_SCHEMA, SIGNAL_SCHEMA, SUBSCRIPTION_PLAN_SCHEMA, SUBSCRIPTION_SCHEMA, USER_SCHEMA } from "src/Schema";
import { ProviderController } from "./provider.controller";
import { ProviderService } from "src/services/provider.service";
import { FirebaseService } from "src/services/firebase.service";

@Module({
    imports: [
        MongooseModule.forFeature([USER_SCHEMA, AUTH_SCHEMA, SUBSCRIPTION_PLAN_SCHEMA, SUBSCRIPTION_SCHEMA, CATEGORY_SCHEMA, SIGNAL_SCHEMA, NOTIFICATION_SCHEMA])
    ],
    controllers: [ProviderController],
    providers: [ProviderService, FirebaseService],
    exports: []
})

export class AppProviderModule { }