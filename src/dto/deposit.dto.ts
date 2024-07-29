import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { OptionalImageDto } from "./file.dto";
import { Types } from "mongoose";

export class DepositDto extends OptionalImageDto {
    @ApiProperty()
    @IsPositive({ message: 'Amount should be greater than 0.' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount should be number.' })
    @IsNotEmpty({ message: 'Amount is required.' })
    @Type(() => Number)
    amount: number;
    @ApiProperty()
    @IsMongoId({ message: 'Not a valid Payment method.' })
    @IsNotEmpty({ message: 'Payment method is required.' })
    @Type(() => Types.ObjectId)
    paymentMethodId: string;
    @ApiProperty()
    @IsNotEmpty({ message: 'Transaction Id is required.' })
    transactionId: string;
}