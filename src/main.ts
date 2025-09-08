import { ResponseTimeInterceptor } from './common/interceptors/response-time.interceptor';
import { EmailNormalizationPipe } from './common/pipes/email-normalization.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/filter/all-exceptions.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { TrimStringPipe } from './common/pipes/trim-string.pipe';
import { RedisStore as RedisStoreLimit } from 'rate-limit-redis';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { redisClient } from './redis/redis.provider';
import { ValidationPipe } from '@nestjs/common';
import { rateLimit } from 'express-rate-limit';
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

  //Using the Limiter on every req in the app
  app.use(limiter);

  app.useGlobalPipes(
    new EmailNormalizationPipe(),
    new TrimStringPipe(),
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

  //CSRF config
  app.use(
    csurf({
      cookie: false, // Use session storage (not cookies)
    }),
  );

  app.use(helmet()); // security headers
  app.use(morgan('dev')); // logs every request

  //Swagger config
  const config = new DocumentBuilder()
    .setTitle('E-commerce Category API')
    .setDescription('This is a doc for my apis')
    .setVersion('1.0')
    .addCookieAuth('connect.sid')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  //add a global filter for our exception
  app.useGlobalFilters(new AllExceptionsFilter());

  //add global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseTimeInterceptor(),
    new AuditInterceptor(),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
