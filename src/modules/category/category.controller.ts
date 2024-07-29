import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { HasAccess } from "src/decorator/access.decorator";
import { HasRoles } from "src/decorator/role.decorator";
import { CurrentUser } from "src/decorator/user.decorator";
import { CategoryDto } from "src/dto/category.dto";
import { AccessEnum } from "src/enum/access.enum";
import { RoleEnum } from "src/enum/role.enum";
import { IUser } from "src/interface/user.interface";
import { CategoryService } from "src/services/category.service";
import { AccessGuard } from "src/services/guard/access.guard";
import { JwtAuthGuard } from "src/services/guard/jwt-auth.guard";
import { RolesGuard } from "src/services/guard/role.guard";

@ApiTags('category')
@Controller('category')
export class CategoryController {
    constructor(private categoryService: CategoryService) { }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('support')
    createSupportCategory(@Body() categoryDto: CategoryDto, @CurrentUser() user: IUser) {
        return this.categoryService.createSupportCategory(categoryDto, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Post('')
    create(@Body() categoryDto: CategoryDto, @CurrentUser() user: IUser) {
        return this.categoryService.create(categoryDto, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Put('support/:id')
    updateSupportCategory(@Param('id') id: string, @Body() updateCategoryDto: CategoryDto, @CurrentUser() user: IUser) {
        return this.categoryService.updateSupportCategory(id, updateCategoryDto, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Put(':id')
    update(@Param('id') id: string, @Body() updateCategoryDto: CategoryDto, @CurrentUser() user: IUser) {
        return this.categoryService.update(id, updateCategoryDto, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('support/all')
    getAllSupportCategoryAdmin(@CurrentUser() user: IUser) {
        return this.categoryService.getAllSupportCategoryAdmin(user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @Get('all')
    getAllAdmin(@CurrentUser() user: IUser) {
        return this.categoryService.getAllAdmin(user);
    }

    @ApiOperation({ summary: 'PROVIDER | TRADER' })
    @HasRoles(RoleEnum.PROVIDER, RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('support')
    getAllSupportCategory(@CurrentUser() user: IUser) {
        return this.categoryService.getAllSupportCategory(user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Get('support/:id')
    getSupportCategoryById(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.categoryService.getSupportCategoryById(id, user);
    }

    @ApiOperation({ summary: 'PROVIDER | TRADER' })
    @HasRoles(RoleEnum.PROVIDER, RoleEnum.TRADER)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Get('')
    getAll(@CurrentUser() user: IUser) {
        return this.categoryService.getAll(user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Get(':id')
    getById(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.categoryService.getById(id, user);
    }

    @ApiOperation({ summary: 'ADMIN' })
    @HasRoles(RoleEnum.ADMIN, RoleEnum.ADMINUSER)
    @HasAccess(AccessEnum.CONFIGURATION)
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard, AccessGuard)
    @ApiParam({ name: 'id' })
    @Delete('support/:id')
    deleteSupportCategory(@Param('id') id: string, @CurrentUser() user: IUser) {
        return this.categoryService.deleteSupportCategory(id, user);
    }

}