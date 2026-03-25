import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// @Global() → PrismaService sera disponible dans toute l'app
// sans avoir besoin de réimporter PrismaModule dans chaque module
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}