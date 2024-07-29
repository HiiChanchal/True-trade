import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MultipleImagesDto {
    @ApiProperty({ type: 'array', items: { type: 'file', format: 'binary' }, required: true })
    images: Express.Multer.File[];
}
export class ImageDto {
    @ApiProperty({ type: 'file', format: 'binary', required: true })
    image: Express.Multer.File
}
export class OptionalImageDto {
    @ApiProperty({ type: 'file', format: 'binary', required: false })
    image: Express.Multer.File;
    @ApiPropertyOptional()
    avatar?: string
}