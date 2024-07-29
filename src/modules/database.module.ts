import { DynamicModule, Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ALL_SCHEMA } from "src/Schema";
import { DatabaseConfigService } from "src/services/db-config.service";

@Global()
@Module({})
export class AppDatabaseModule {
    private static mongoDbConnectionModule: DynamicModule;
    private static mongoDbAllSchemaModule: DynamicModule;

    public static forRootConnection() {
        if (!this.mongoDbConnectionModule) {
            this.mongoDbConnectionModule = MongooseModule.forRootAsync({
                useClass: DatabaseConfigService,
            });
        }
        return this.mongoDbConnectionModule;
    }

    public static forFeatureAsync() {
        if (!this.mongoDbAllSchemaModule) {
            this.mongoDbAllSchemaModule = MongooseModule.forFeature(ALL_SCHEMA);
        }

        return this.mongoDbAllSchemaModule;
    }
}
