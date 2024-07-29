import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AUTH_SCHEMA, NOTIFICATION_SCHEMA, TRANSACTION_SCHEMA, USER_SCHEMA } from 'src/Schema';
import { TransactionController } from './transaction.controller';
import { TransactionService } from 'src/services/transaction.service';
import { FirebaseService } from 'src/services/firebase.service';

@Module({
    imports: [MongooseModule.forFeature([TRANSACTION_SCHEMA,USER_SCHEMA,AUTH_SCHEMA,NOTIFICATION_SCHEMA])],
    controllers: [TransactionController],
    providers: [TransactionService,FirebaseService],
    exports: []
})
export class AppTransactionModule { }