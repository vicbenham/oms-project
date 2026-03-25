import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, } from '@nestjs/swagger';
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { AddActionDto } from './dto/add-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Workflows')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un workflow' })
  create(@Request() req, @Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister mes workflows' })
  findAll(@Request() req) {
    return this.workflowsService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un workflow' })
  findOne(@Request() req, @Param('id') id: string) {
    return this.workflowsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un workflow' })
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer un workflow' })
  delete(@Request() req, @Param('id') id: string) {
    return this.workflowsService.delete(id, req.user.id);
  }

  @Post(':id/actions')
  @ApiOperation({ summary: 'Ajouter une action au workflow' })
  addAction(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddActionDto,
  ) {
    return this.workflowsService.addAction(id, req.user.id, dto);
  }

  @Delete(':id/actions/:actionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une action du workflow' })
  removeAction(
    @Request() req,
    @Param('id') id: string,
    @Param('actionId') actionId: string,
  ) {
    return this.workflowsService.removeAction(id, actionId, req.user.id);
  }

  @Post(':id/trigger')
  @ApiOperation({ summary: 'Déclencher manuellement un workflow' })
  trigger(@Request() req, @Param('id') id: string) {
    return this.workflowsService.triggerManually(id, req.user.id);
  }
}