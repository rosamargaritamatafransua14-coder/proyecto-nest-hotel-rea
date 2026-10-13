import { Test, TestingModule } from '@nestjs/testing';
import { HuespedController } from './huesped.controller.js';
import { HuespedService } from './huesped.service.js';

describe('HuespedController', () => {
  let controller: HuespedController;

  // HuespedService falso: el controlador solo debe delegar en el servicio
  const serviceMock = {
    listarHuespedes: vi.fn().mockResolvedValue([]),
    buscarUnHuesped: vi.fn(),
    crearHuesped: vi.fn(),
    actualizarHuesped: vi.fn(),
    desactivarHuesped: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HuespedController],
      providers: [{ provide: HuespedService, useValue: serviceMock }],
    }).compile();

    controller = module.get<HuespedController>(HuespedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('listarHuespedes llama al servicio', async () => {
    await expect(controller.listarHuespedes()).resolves.toEqual([]);
    expect(serviceMock.listarHuespedes).toHaveBeenCalled();
  });
});