## The Integrated Driver's License Management System (IDLMS) Backend API
## Description

The Integrated Driver's License Management System (IDLMS) is a comprehensive digital platform designed to streamline vehicle registration, driver licensing, and related services in Lagos State

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# Create database
$ npm run db:create

# development powered by SWC
$ npm run start

# Generate migration from entity
$ npm run migration:generate ./src/database/migrations/{migrationName}

# Create migration
$ npm run migration:create ./src/database/migrations/{migrationName}

# watch mode
$ npm run watch

# Run migrations
$ npm run migrate

# Rollback all migrations
$ npm run migration:drop

# Rollback last migration
$ npm run migration:rollback

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```
