import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import passport from 'passport';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { redisClient } from './redis/redis.provider';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //This is not nessessary cause Redis store handls it auto
  //const RedisStore = connectRedis(session);

  app.use(
    session({
      store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
      secret: process.env.SESSION_SECRET || 'super-secret', //Used to sign the session ID cookie
      resave: false,
      saveUninitialized: false, //Don’t save empty sessions
      cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        httpOnly: true, // cookie not accessible via JS
        secure: false, // set to true in production (https)
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
