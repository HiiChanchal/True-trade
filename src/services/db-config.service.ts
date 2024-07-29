import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MongooseModuleOptions, MongooseOptionsFactory } from "@nestjs/mongoose";

@Injectable()
export class DatabaseConfigService implements MongooseOptionsFactory {
    private connectionName: string = null;
    constructor(private configService: ConfigService) { }

    createMongooseOptions(): MongooseModuleOptions {
        return {
            uri: this.configService.get('DB_URL'),
            dbName: this.configService.get('DB_NAME'),
            user: this.configService.get('DB_USERNAME') == 'null' ? null : this.configService.get('DB_USERNAME'),
            pass: this.configService.get('DB_PASSWORD') == 'null' ? null : this.configService.get('DB_PASSWORD'),
            retryAttempts: 3,
            autoCreate: true,
            connectionFactory: (connection, name) => {
                this.connectionName = name;
                return connection
            }
        };
    }

    public getConnectionName(): string {
        return this.connectionName;
    }

}