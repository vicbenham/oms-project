import { Test, TestingModule } from '@nestjs/testing';
import { EngineService } from '../engine.service';
import { WorkflowRepository } from '../../workflows/repositories/workflow.repository';
import { ExecutionRepository } from '../repositories/execution.repository';
import { ActionHandlerFactory } from '../action-handler.factory';
import { ExecutionStatus, ResultStatus } from '@prisma/client';

const mockWorkflowRepository = {
  findActiveByTrigger: jest.fn(),
};

const mockExecutionRepository = {
  createExecution: jest.fn().mockResolvedValue({ id: 'exec-1' }),
  completeExecution: jest.fn(),
  createActionResult: jest.fn(),
};

// Factory dont le handler va échouer sur la première action
const mockActionHandlerFactory = {
  getHandler: jest.fn(),
};

describe('EngineService — sequential action execution', () => {
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
    jest.clearAllMocks();
    mockExecutionRepository.createExecution.mockResolvedValue({ id: 'exec-1' });
  });

  it("devrait marquer l'exécution en FAILED si une action échoue", async () => {
    // Arrange — workflow avec une action qui va échouer
    mockWorkflowRepository.findActiveByTrigger.mockResolvedValue([
      {
        id: 'workflow-1',
        name: 'Test workflow',
        condition: null,
        actions: [{ id: 'action-1', type: 'NOTIFY_USER', order: 1 }],
      },
    ]);

    // Le handler lève une erreur
    mockActionHandlerFactory.getHandler.mockReturnValue({
      execute: jest.fn().mockRejectedValue(new Error('SMTP server unreachable')),
    });

    // Act
    await service.onOrderCreated({ userId: 'user-1', orderId: 'order-1' });

    // Assert — l'action result doit être FAILED
    expect(mockExecutionRepository.createActionResult).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ResultStatus.FAILED,
        output: 'SMTP server unreachable',
      }),
    );

    // Assert — l'exécution globale doit être FAILED
    expect(mockExecutionRepository.completeExecution).toHaveBeenCalledWith(
      'exec-1',
      ExecutionStatus.FAILED,
    );
  });

  it('devrait continuer les actions suivantes même si une action échoue', async () => {
    // Arrange — workflow avec 2 actions, la première échoue
    mockWorkflowRepository.findActiveByTrigger.mockResolvedValue([
      {
        id: 'workflow-1',
        name: 'Test workflow',
        condition: null,
        actions: [
          { id: 'action-1', type: 'NOTIFY_USER', order: 1 },
          { id: 'action-2', type: 'CREATE_LOG', order: 2 },
        ],
      },
    ]);

    // Premier appel échoue, deuxième réussit
    mockActionHandlerFactory.getHandler
      .mockReturnValueOnce({
        execute: jest.fn().mockRejectedValue(new Error('First action failed')),
      })
      .mockReturnValueOnce({
        execute: jest.fn().mockResolvedValue('Second action success'),
      });

    // Act
    await service.onOrderCreated({ userId: 'user-1', orderId: 'order-1' });

    // Assert — les 2 actions doivent avoir été tentées
    expect(mockExecutionRepository.createActionResult).toHaveBeenCalledTimes(2);

    // Assert — première action en erreur
    expect(mockExecutionRepository.createActionResult).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ status: ResultStatus.FAILED, order: 1 }),
    );

    // Assert — deuxième action en succès malgré l'échec de la première
    expect(mockExecutionRepository.createActionResult).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ status: ResultStatus.SUCCESS, order: 2 }),
    );
  });
});