import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Ce guard protège les routes — il suffit de l'ajouter avec @UseGuards(JwtAuthGuard)
// Il vérifie automatiquement le token JWT via la JwtStrategy
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}