import { ApiProperty, ApiPropertyOptional, IntersectionType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, IsNumber, IsIn, Min, IsMongoId, ValidateIf, IsPositive } from "class-validator";
import { Types } from "mongoose";
import { SignalTypeEnum, SignalDurationEnum, SignalStatusEnum } from "src/enum/signal.enum";
import { PaginationDto } from "./pagination.dto";
import { SignalStopLoss, SignalTarget } from "src/decorator/validator/signal.decorator";
import { OptionalDateRangeDto } from "./date.dto";

export class SignalDto {
    @ApiProperty({ type: String })
    @IsMongoId({ message: 'Not a valid category.' })
    @IsNotEmpty({ message: 'Category is required.' })
    @Type(() => Types.ObjectId)
    category: Types.ObjectId;
    @ApiProperty()
    @IsString({ message: 'Title must be string' })
    @IsNotEmpty({ message: 'Title must be required' })
    title: string;
    @ApiProperty({ type: String, enum: SignalTypeEnum })
    @IsIn(Object.values(SignalTypeEnum))
    @IsString({ message: 'Type must be string' })
    @IsNotEmpty({ message: 'Type name must be required' })
    type: string;
    @ApiProperty({ type: String, enum: SignalDurationEnum })
    @IsIn(Object.values(SignalDurationEnum))
    @IsString({ message: 'Duration must be string' })
    @IsNotEmpty({ message: 'Duration must be required' })
    duration: string;
    @ApiProperty()
    @IsPositive({ message: 'Entry price should be greater than 0.' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Entry price should be number.' })
    @IsNotEmpty({ message: 'Entry is required.' })
    @Type(() => Number)
    entry: number;
    @ApiProperty()
    @SignalStopLoss()
    @IsPositive({ message: 'Stoploss should be greater than 0.' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Stoploss Price should be number.' })
    @IsNotEmpty({ message: 'Stoploss Price is required.' })
    @Type(() => Number)
    stoploss: number;
    @ApiProperty()
    @SignalTarget()
    @IsPositive({ message: 'Target should be greater than 0.' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Target Price should be number.' })
    @IsNotEmpty({ message: 'Target Price is required.' })
    @Type(() => Number)
    target: number;
}

export class SignalStatusDto {
    @ApiProperty({ type: String, enum: SignalStatusEnum })
    @IsIn(Object.values(SignalStatusEnum))
    @IsString({ message: 'Status must be string' })
    @IsNotEmpty({ message: 'Status must be required' })
    status: string
}

export class CommentDto {
    @ApiProperty()
    @IsString({ message: 'Comment must be string' })
    @IsNotEmpty({ message: 'Comment must be required' })
    message: string;
}

export class SearchSignalDto extends IntersectionType(SignalStatusDto, PaginationDto) {
    @ApiPropertyOptional()
    @IsMongoId({ message: 'Not a valid category.' })
    @IsNotEmpty({ message: 'Category is required.' })
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.category)
    category?: string;
}

export class AdminSearchSignalDto extends IntersectionType(PaginationDto, OptionalDateRangeDto) {
    @ApiPropertyOptional()
    @IsMongoId({ message: 'Not a valid category.' })
    @IsNotEmpty({ message: 'Category is required.' })
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.category)
    category?: string;
    @ApiPropertyOptional({ type: String, enum: SignalStatusEnum })
    @IsIn(Object.values(SignalStatusEnum))
    @IsString({ message: 'Status must be string' })
    @IsNotEmpty({ message: 'Status must be required' })
    @ValidateIf(o => o.status)
    status?: string
}