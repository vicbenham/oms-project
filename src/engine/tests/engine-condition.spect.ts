// src/engine/tests/engine-condition.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EngineService } from '../engine.service';
import { WorkflowRepository } from '../../workflows/repositories/workflow.repository';
import { ExecutionRepository } from '../repositories/execution.repository';
import { ActionHandlerFactory } from '../action-handler.factory';
import { TriggerType, ExecutionStatus } from '@prisma/client';

// Mock du WorkflowRepository — on ne veut pas toucher la base de données
const mockWorkflowRepository = {
  findActiveByTrigger: jest.fn(),
};

// Mock du ExecutionRepository
const mockExecutionRepository = {
  createExecution: jest.fn(),
  completeExecution: jest.fn(),
  createActionResult: jest.fn(),
};

// Mock de la Factory — retourne un handler fictif
const mockActionHandlerFactory = {
  getHandler: jest.fn().mockReturnValue({
    execute: jest.fn().mockResolvedValue('Action executed successfully'),
  }),
};

describe('EngineService — condition evaluation (US15)', () => {
  let service: EngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngineService,
        { provide: WorkflowRepository, useValue: mockWorkflowRepository },
        { provide: ExecutionRepository, useValue: mockExecutionRepository },
        { provide: ActionHandlerFactory, useValue: mockActionHandlerFactory },
      ],
    }).compile();

    service = module.get<EngineService>(EngineService);

    // Réinitialise les mocks entre chaque test
    jest.clearAllMocks();
  });

  it('devrait exécuter le workflow si la condition est remplie (amount > 100)', async () => {
    // Arrange — workflow avec condition amount > 100
    mockWorkflowRepository.findActiveByTrigger.mockResolvedValue([
      {
        id: 'workflow-1',
        name: 'Test workflow',
        condition: { field: 'amount', operator: '>', value: 100 },
        actions: [{ id: 'action-1', type: 'NOTIFY_USER', order: 1 }],
      },
    ]);

    mockExecutionRepository.createExecution.mockResolvedValue({ id: 'exec-1' });

    // Act — contexte avec amount = 150, la condition doit être satisfaite
    await service.onOrderCreated({ userId: 'user-1', orderId: 'order-1', amount: 150 });

    // Assert — l'exécution doit avoir été créée et complétée
    expect(mockExecutionRepository.createExecution).toHaveBeenCalledTimes(1);
    expect(mockExecutionRepository.completeExecution).toHaveBeenCalledWith(
      'exec-1',
      ExecutionStatus.SUCCESS,
    );
  });

  it('devrait ignorer le workflow si la condition n\'est pas remplie (amount > 100 mais amount = 50)', async () => {
    // Arrange — même workflow avec condition amount > 100
    mockWorkflowRepository.findActiveByTrigger.mockResolvedValue([
      {
        id: 'workflow-1',
        name: 'Test workflow',
        condition: { field: 'amount', operator: '>', value: 100 },
        actions: [{ id: 'action-1', type: 'NOTIFY_USER', order: 1 }],
      },
    ]);

    // Act — contexte avec amount = 50, la condition ne doit pas être satisfaite
    await service.onOrderCreated({ userId: 'user-1', orderId: 'order-1', amount: 50 });

    // Assert — aucune exécution ne doit avoir été créée
    expect(mockExecutionRepository.createExecution).not.toHaveBeenCalled();
    expect(mockExecutionRepository.completeExecution).not.toHaveBeenCalled();
  });

  it("devrait exécuter le workflow si aucune condition n'est définie", async () => {
    // Arrange — workflow sans condition
    mockWorkflowRepository.findActiveByTrigger.mockResolvedValue([
      {
        id: 'workflow-1',
        name: 'Test workflow',
        condition: null,
        actions: [{ id: 'action-1', type: 'CREATE_LOG', order: 1 }],
      },
    ]);

    mockExecutionRepository.createExecution.mockResolvedValue({ id: 'exec-1' });

    // Act
    await service.onOrderCreated({ userId: 'user-1', orderId: 'order-1', amount: 50 });

    // Assert — l'exécution doit avoir été créée même sans condition
    expect(mockExecutionRepository.createExecution).toHaveBeenCalledTimes(1);
  });
});