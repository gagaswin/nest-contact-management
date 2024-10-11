import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './app/user/user.module';
import { ContactModule } from './app/contact/contact.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AddressModule } from './app/address/address.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('PORT'),
        username: configService.get('USERNAME'),
        password: configService.get('PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        /* === do NOT use synchronize: true in real projects ===
        karena karena hal ini dapat secara otomatis mengubah skema database, 
        yang bisa berisiko jika terjadi perubahan yang tidak terkontrol.
        dropSchema untuk selalu menghapus shcema dan membuatnya lagi
        ketika di re run*/
        // synchronize: true,
        // dropSchema: true,
      }),
    }),
    UserModule,
    ContactModule,
    AddressModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
