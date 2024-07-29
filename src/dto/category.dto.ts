import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from "class-validator";

export class CategoryDto  {
    @ApiProperty()
    @IsString({ message: 'Category name must be string' })
    @IsNotEmpty({ message: 'Category name must be required' })
    name: string;

    @ApiPropertyOptional()
    @ValidateIf(o => o.description) 
    @IsString({ message: 'category description must be a string' })
    description: string;

}