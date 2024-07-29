import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AUTH_SCHEMA, CATEGORY_SCHEMA, MY_TRADE_SCHEMA, NOTIFICATION_SCHEMA, SIGNAL_COMMENT_VIEW_SCHEMA, SIGNAL_SCHEMA, SUBSCRIPTION_PLAN_SCHEMA, SUBSCRIPTION_SCHEMA, TRANSACTION_SCHEMA, USER_SCHEMA } from "src/Schema";
import { TraderController } from "./trader.controller";
import { TraderService } from "src/services/trader.service";
import { FirebaseService } from "src/services/firebase.service";

@Module({
    imports: [
        MongooseModule.forFeature([USER_SCHEMA, AUTH_SCHEMA, CATEGORY_SCHEMA, SUBSCRIPTION_PLAN_SCHEMA, SUBSCRIPTION_SCHEMA, TRANSACTION_SCHEMA, SIGNAL_SCHEMA, NOTIFICATION_SCHEMA, MY_TRADE_SCHEMA, SIGNAL_COMMENT_VIEW_SCHEMA])
    ],
    controllers: [TraderController],
    providers: [TraderService, FirebaseService],
    exports: []
})

export class AppTraderModule { }