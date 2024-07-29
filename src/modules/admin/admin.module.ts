import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ADMIN_SCHEMA, AUTH_SCHEMA, AVATAR_SCHEMA, CATEGORY_SCHEMA, SIGNAL_SCHEMA } from "src/Schema";
import { AdminController } from "./admin.controller";
import { AdminService } from "src/services/admin.service";

@Module({
    imports: [
        MongooseModule.forFeature([ADMIN_SCHEMA, AUTH_SCHEMA, AVATAR_SCHEMA, CATEGORY_SCHEMA, SIGNAL_SCHEMA])
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: []
})

export class AppAdminModule { }