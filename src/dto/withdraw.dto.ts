import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { Types } from "mongoose";

export class WithdrawDto {
    @ApiProperty()
    @IsPositive({ message: 'Amount should be greater than 0.' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Amount should be number.' })
    @IsNotEmpty({ message: 'Amount is required.' })
    @Type(() => Number)
    amount: number;
    @ApiProperty()
    @IsPositive({ message: 'Commission should be greater than 0.' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Commission should be number.' })
    @IsNotEmpty({ message: 'Commission is required.' })
    @Type(() => Number)
    commission: number;
    @ApiProperty()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Charge should be number.' })
    @IsNotEmpty({ message: 'Charge is required.' })
    @Type(() => Number)
    charge: number;
    @ApiProperty()
    @IsMongoId({ message: 'Not a valid Payment method.' })
    @IsNotEmpty({ message: 'Payment method is required.' })
    @Type(() => Types.ObjectId)
    paymentMethodId: string;
}