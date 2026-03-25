import { Injectable, ConflictException, UnauthorizedException, } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    // EventEmitter2 permet d'émettre des événements métier découplés
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async register(dto: RegisterDto) {
    // Vérifie qu'un utilisateur avec cet email n'existe pas déjà
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    // Hash du mot de passe — jamais stocké en clair (US11)
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userRepository.create(dto.email, hashedPassword);

    // Émet l'événement métier user.registered (US04)
    // Le workflow engine écoutera cet événement
    this.eventEmitter.emit('user.registered', { userId: user.id, email: user.email });

    // On ne retourne jamais le mot de passe dans la réponse
    const { password, ...result } = user;
    return result;
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare le mot de passe fourni avec le hash stocké
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Génère le JWT avec l'id et l'email comme payload
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }
}