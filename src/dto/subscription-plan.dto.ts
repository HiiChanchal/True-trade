import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsIn, IsMongoId, IsNotEmpty, IsNumber, Min, ValidateIf, ValidateNested } from "class-validator";
import { Types } from "mongoose";
import { PaginationDto } from "./pagination.dto";
import { SubscriptionStatusEnum } from "src/enum/subscription.enum";


export class SubscriptionPlanDto {
    @ApiProperty({ type: String })
    @IsMongoId({ message: 'Not a valid category.' })
    @IsNotEmpty({ message: 'Category is required.' })
    @Type(() => Types.ObjectId)
    category: Types.ObjectId;
    @ApiProperty()
    @Min(0.5, { message: 'Monthly Price should be greater than or equal to 0.5' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Monthly Price should be number.' })
    @IsNotEmpty({ message: 'Monthly Price is required.' })
    @Type(() => Number)
    monthly: number;
    @ApiProperty()
    @Min(0.5, { message: 'Quarterly Price should be greater than or equal to 0.5' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Quarterly Price should be number.' })
    @IsNotEmpty({ message: 'Quarterly Price is required.' })
    @Type(() => Number)
    quarterly: number;
    @ApiProperty()
    @Min(0.5, { message: 'HalfYearly Price should be greater than or equal to 0.5' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'HalfYearly Price should be number.' })
    @IsNotEmpty({ message: 'HalfYearly Price is required.' })
    @Type(() => Number)
    halfYearly: number;
    @ApiProperty()
    @Min(0.5, { message: 'Yearly Price should be greater than or equal to 0.5' })
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Yearly Price should be number.' })
    @IsNotEmpty({ message: 'Yearly Price is required.' })
    @Type(() => Number)
    yearly: number;
}

export class ProviderPlanDto {
    @ApiProperty({ type: [SubscriptionPlanDto] })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => SubscriptionPlanDto)
    plans: SubscriptionPlanDto[]
}

export class SearchProviderSubscriberDto extends PaginationDto {
    @ApiProperty({ type: String, enum: SubscriptionStatusEnum })
    @IsIn(Object.values(SubscriptionStatusEnum))
    @IsNotEmpty({ message: 'Status must be required' })
    status: string
    @ApiPropertyOptional({ type: String })
    @IsMongoId({ message: 'Not a valid category.' })
    @Type(() => Types.ObjectId)
    @ValidateIf(o => o.category)
    category?: Types.ObjectId;
}