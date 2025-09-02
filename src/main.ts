import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import passport from 'passport';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { redisClient } from './redis/redis.provider';
import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //This is not nessessary cause Redis store handls it auto
  //const RedisStore = connectRedis(session);

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
  app.use(passport.initialize());
  app.use(passport.session());

  // This is just for The DTO so in every req that has a dto apply it auto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips unknown properties
      forbidNonWhitelisted: true, // throws error if extra properties are sent
      transform: true, // auto-transform payloads to DTO classes
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
