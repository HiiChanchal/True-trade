import { Body, Controller, Get, Post, Put, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { HasAccess } from 'src/decorator/access.decorator';
import { HasRoles } from 'src/decorator/role.decorator';
import { CurrentUser } from 'src/decorator/user.decorator';
import { InquiryDto, InquiryUpdateDto, SearchInquiryDto } from 'src/dto/inquiry.dto';
import { AccessEnum } from 'src/enum/access.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { IUser } from 'src/interface/user.interface';
import { AccessGuard } from 'src/services/guard/access.guard';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { InquiryService } from 'src/services/inquiry.service';

@ApiTags('Inquiry')
@Controller('inquiry')
export class InquiryController {
    constructor(private inquiryService: InquiryService) { }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('')
    create(@Body() inquiryDto: InquiryDto, @CurrentUser() user: IUser) {
        return this.inquiryService.create(inquiryDto, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CHAT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('download')
    downloadAllChat(@Query() query: SearchInquiryDto, @CurrentUser() user: IUser) {
        return this.inquiryService.downloadAllChat(query, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CHAT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Get('download/:id')
    downloadChatHistory(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.inquiryService.downloadChatHistory(id, user);
    }

    @HasAccess(AccessEnum.CHAT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AccessGuard)
    @Get('')
    getAll(@Query() query: SearchInquiryDto, @CurrentUser() user: IUser) {
        return this.inquiryService.getAll(query, user);
    }

    @HasAccess(AccessEnum.CHAT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AccessGuard)
    @Get(':id')
    @ApiParam({ name: 'id' })
    getById(@Param('id') id: string) {
        return this.inquiryService.getById(id);
    }

    @HasAccess(AccessEnum.CHAT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AccessGuard)
    @Put(':id/close')
    @ApiParam({ name: 'id' })
    close(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.inquiryService.close(id, user);
    }

    @HasAccess(AccessEnum.CHAT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AccessGuard)
    @Put(':id')
    @ApiParam({ name: 'id' })
    update(@Param('id') id: string, @Body() inquiryDto: InquiryUpdateDto, @CurrentUser() user: IUser) {
        return this.inquiryService.update(id, inquiryDto, user);
    }

    @HasAccess(AccessEnum.CHAT)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, AccessGuard)
    @Delete(':id')
    @ApiParam({ name: 'id' })
    delete(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.inquiryService.delete(id, user);
    }
}