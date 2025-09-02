import { RedisStore as RedisStoreLimit } from 'rate-limit-redis';
import { redisClient } from './redis/redis.provider';
import { ValidationPipe } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'connect-redis';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import session from 'express-session';
import passport from 'passport';
import helmet from 'helmet';
import morgan from 'morgan';
import csurf from 'csurf';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Allowed origins that can make a req to our API
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL?.split(',')
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  });

  // Parses cookies into req.cookies
  app.use(cookieParser(process.env.COOKIE_SECRET));

  //Global Rate Limiter
  const limiter = rateLimit({
    store: new RedisStoreLimit({
      sendCommand: (...args: string[]) => redisClient.sendCommand(args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
  });

  //To apply DTO on every req that has a dto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error if extra properties are sent
      transform: true, // auto-transform payloads to DTO classes
    }),
  );

  //Session Config
  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: 'sess:',
        ttl: 3600,
      }),
      secret: process.env.SESSION_SECRET || 'super-secret',
      resave: false,
      saveUninitialized: false, //Don’t save empty sessions
      name: 'connect.sid',
      cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true, // cookie not accessible via JS
        secure: false, // set to true in production (https)
        sameSite: 'lax',
      },
    }),
  );

  //Passport config
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(
    csurf({
      cookie: false, // Use session storage (not cookies)
    }),
  );
  //Using the Limiter on every req in the app
  app.use(limiter);

  app.use(helmet()); // security headers
  app.use(morgan('dev')); // logs every request

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
