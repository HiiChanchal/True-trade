import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HasAccess } from 'src/decorator/access.decorator';
import { HasRoles } from 'src/decorator/role.decorator';
import { CurrentUser } from 'src/decorator/user.decorator';
import { SiteContentDto } from 'src/dto/site-content.dto';
import { AccessEnum } from 'src/enum/access.enum';
import { SiteContentEnum } from 'src/enum/common.enum';
import { RoleEnum } from 'src/enum/role.enum';
import { IUser } from 'src/interface/user.interface';
import { AccessGuard } from 'src/services/guard/access.guard';
import { JwtAuthGuard } from 'src/services/guard/jwt-auth.guard';
import { RolesGuard } from 'src/services/guard/role.guard';
import { SiteContentService } from 'src/services/site-content.service';
@ApiTags('Site Content')
@Controller('site-content')
export class SiteContentController {
    constructor(private readonly siteContentService: SiteContentService) { }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('')
    create(@Body() siteContentDto: SiteContentDto, @CurrentUser() user: IUser) {
        return this.siteContentService.create(siteContentDto, user);
    }

    @Get('by-type')
    @ApiQuery({ name: 'type', enum: SiteContentEnum })
    getByType(@Query('type') type: String) {
        return this.siteContentService.getByType(type);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('')
    get() {
        return this.siteContentService.getAll();
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get(':id')
    @ApiParam({ name: 'id' })
    getById(@Param('id') id: string) {
        return this.siteContentService.getById(id);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Put(':id')
    @ApiParam({ name: 'id' })
    update(@Param('id') id: string, @Body() siteContentDto: SiteContentDto, @CurrentUser() user: IUser) {
        return this.siteContentService.update(id, siteContentDto, user);
    }

    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Delete(':id')
    @ApiParam({ name: 'id' })
    delete(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.siteContentService.delete(id, user);
    }
}