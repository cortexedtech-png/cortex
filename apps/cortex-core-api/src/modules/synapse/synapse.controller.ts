import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SynapseService } from './synapse.service';
import { ActionLog, SynapseScenario, StoryArc } from '@cortex/types';

@Controller('synapse')
export class SynapseController {
  private readonly logger = new Logger(SynapseController.name);

  constructor(private readonly synapseService: SynapseService) {}

  @Post('scenario')
  async generateScenario(
    @Body()
    body: {
      sessionId: string;
      stage: number;
      loreId?: string;
      missionId?: string;
      sessionHistory?: ActionLog[];
    },
  ): Promise<SynapseScenario> {
    if (!body.sessionId || !body.stage) {
      throw new HttpException(
        'Missing sessionId or stage',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const scenario = await this.synapseService.generateScenario(
        body.sessionId,
        body.stage,
        body.sessionHistory,
        body.loreId,
        body.missionId,
      );
      return scenario;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating scenario: ${errorMessage}`);
      throw new HttpException(
        'Failed to generate scenario',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('story-arc')
  async generateStoryArc(
    @Body()
    body: {
      loreId?: string;
      missionId?: string;
    },
  ): Promise<StoryArc> {
    try {
      return await this.synapseService.generateStoryArc(
        body.loreId || 'cyberpunk-01',
        body.missionId,
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Error generating story arc: ${errorMessage}`);
      throw new HttpException(
        'Failed to generate story arc',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
