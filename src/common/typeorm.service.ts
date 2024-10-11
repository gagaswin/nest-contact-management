import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { DataSource } from 'typeorm';
import { Logger } from 'winston';

@Injectable()
export class TypeOrmService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,
    private dataSource: DataSource,
  ) {
    this.initializeLogging();
  }

  private initializeLogging() {
    // masih salah dan belum ngerti buat logging pake winston di typeorm
  }
}
