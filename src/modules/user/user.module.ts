import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AVATAR_SCHEMA, NOTIFICATION_SCHEMA, PAYMENT_METHOD_SCHEMA, TRANSACTION_SCHEMA, USER_SCHEMA } from "src/Schema";
import { UserController } from "./user.controller";
import { UserService } from "src/services/user.service";
import { AppConfigService } from "src/services/config.service";
import { StripeService } from "src/services/stripe.service";

@Module({
    imports: [
        MongooseModule.forFeature([USER_SCHEMA, AVATAR_SCHEMA, TRANSACTION_SCHEMA, NOTIFICATION_SCHEMA, PAYMENT_METHOD_SCHEMA])
    ],
    controllers: [UserController],
    providers: [UserService, AppConfigService, StripeService],
    exports: []
})

export class AppUserModule { }