import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { ValidationService } from './validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/app/user/entities/user.entity';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    ValidationService,
    { provide: APP_FILTER, useClass: ErrorFilter },
  ],
  exports: [ValidationService],
})
export class CommonModule {}
