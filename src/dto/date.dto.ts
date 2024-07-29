import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsInt, ValidateIf } from "class-validator";
import { GreaterThan, GreaterThanEqualTo } from "src/decorator/validator/comparison.decorator";

export class DateRangeDto {
    @ApiProperty({ type: 'string' })
    @IsDate({ message: 'Start date is not valid.' })
    @Type(() => Date)
    startDate: Date;
    @ApiProperty({ type: 'string' })
    @GreaterThan('startDate', { message: 'End date should be greater than start date.' })
    @IsDate({ message: 'End date is not valid.' })
    @Type(() => Date)
    endDate: Date;
}
export class OptionalDateRangeDto {
    @ApiPropertyOptional({ type: 'string' })
    @IsDate({ message: 'Start date is not valid.' })
    @Type(() => Date)
    @ValidateIf(o => o.startDate)
    startDate?: Date;
    @ApiPropertyOptional({ type: 'string' })
    @GreaterThanEqualTo('startDate', { message: 'End date should be greater than start date.' })
    @IsDate({ message: 'End date is not valid.' })
    @Type(() => Date)
    @ValidateIf(o => o.endDate)
    endDate?: Date;
}
export class TimezoneDto {
    @ApiProperty()
    @IsInt({ message: 'Timezone should be a number.' })
    @Type(() => Number)
    timezone: number;
}