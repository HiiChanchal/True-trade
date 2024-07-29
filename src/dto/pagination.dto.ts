import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, Min } from "class-validator";


export class PaginationDto {
    @ApiProperty()
    @Min(1, { message: 'Current page should be greater than 0.' })
    @IsInt({ message: 'Current page should be a number.' })
    @Type(() => Number)
    currentPage: number;
    @ApiProperty({ enum: [10, 20, 30, 50, 100] })
    @IsInt({ message: 'Page size should be a number.' })
    @Type(() => Number)
    pageSize: number;
}