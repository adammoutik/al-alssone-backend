# Al Alssone Payments API

A REST API built with [NestJS](https://nestjs.com/) for managing school fee payments — tracking families, students, fees, payments, and payment archives, with authentication and automated notifications.

## Related Repositories

- **Frontend:** [al-alssone-frontend](https://github.com/adammoutik/al-alssone-frontend)

## Features

- **Authentication** — JWT-based login and user management, with route protection via guards
- **Families & Students** — manage family records and link children (students) to a family
- **Fees** — define and manage fee records
- **Payments** — record and track payments against fees, with a separate archive for historical/archived payments
- **Notifications** — email notifications (via Nodemailer / `@nestjs-modules/mailer`) for events like payment reminders, receipts, and overdue alerts, plus scheduled jobs via `@nestjs/schedule`
- **API documentation** — auto-generated Swagger docs
- **Rate limiting** — via `rate-limiter-flexible`

## Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) 11 (Node.js / TypeScript)
- **Database:** MongoDB via [Mongoose](https://mongoosejs.com/)
- **Auth:** JWT (`@nestjs/jwt`), bcrypt password hashing
- **Mail:** Nodemailer + `@nestjs-modules/mailer`
- **Docs:** Swagger (`@nestjs/swagger`)
- **Validation:** `class-validator` / `class-transformer`
- **Testing:** Jest, Supertest
- **Linting/Formatting:** ESLint, Prettier

## Project Structure

```
src/
├── auth/                 # Authentication (login, JWT)
├── users/                # User accounts
├── families/             # Family records
├── students/             # Student records (linked to families)
├── fees/                 # Fee definitions
├── payments/             # Payment records
├── archived-payments/    # Archived/historical payments
├── notifications/        # Email notifications & scheduled jobs
├── guards/                # Auth guards
├── filters/                # Global exception filters
├── app.module.ts
└── main.ts
```

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- A MongoDB instance (local or hosted, e.g. MongoDB Atlas)
- npm

### Installation

```bash
git clone https://github.com/adammoutik/backend.git
cd backend
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable      | Description                                  |
| ------------- | --------------------------------------------- |
| `DB_URL`      | MongoDB connection string                     |
| `JWT`         | Secret used to sign JWT tokens                |
| `MAIL_HOST`   | SMTP host for outgoing email                  |
| `MAIL_PORT`   | SMTP port                                     |
| `MAIL_SECURE` | Whether to use a secure (TLS) SMTP connection |
| `MAIL_USER`   | SMTP username                                 |
| `MAIL_PASS`   | SMTP password                                 |
| `MAIL_FROM`   | "From" address used for outgoing emails       |


### Running the app

```bash
# development (with hot reload)
npm run start:dev

# standard start
npm run start

# production build + run
npm run build
npm run start:prod
```

The API runs on **http://localhost:3000** by default (configurable via the `PORT` environment variable).

Interactive Swagger API docs are available at **http://localhost:3000/api**.

### Running tests

```bash
npm run test        # unit tests
npm run test:e2e    # end-to-end tests
npm run test:cov    # test coverage
```

### Linting & formatting

```bash
npm run lint
npm run format
```

## API Overview

| Resource | Base route | Notes |
| --- | --- | --- |
| Auth | `POST /auth/login`, `POST /auth`, `GET /auth`, `GET /auth/:id`, `PATCH /auth/:id`, `DELETE /auth/:id` | Login and auth record management |
| Users | `POST /users/create`, `GET /users`, `GET /users/:id`, `PATCH /users/:id`, `DELETE /users/:id` | User accounts |
| Families | `POST /families`, `GET /families`, `GET /families/:id`, `PUT /families/:id`, `DELETE /families/:id`, `POST /families/:id/children` | Family records and linking children |
| Students | `POST /students`, `GET /students`, `GET /students/:id`, `PUT /students/:id`, `DELETE /students/:id` | Student records |
| Fees | `POST /fees`, `GET /fees`, `GET /fees/:id`, `PUT /fees/:id`, `DELETE /fees/:id` | Fee definitions |
| Payments | `POST /payments`, `GET /payments`, `GET /payments/:id`, `PATCH /payments/:id`, `DELETE /payments/:id` | Payment records |
| Archived Payments | `POST /archived-payments`, `GET /archived-payments`, `GET /archived-payments/:id`, `GET /archived-payments/student/:studentId`, `GET /archived-payments/family/:familyId`, `PATCH /archived-payments/:id`, `DELETE /archived-payments/:id` | Historical/archived payments |
| Notifications | `GET /notifications`, `GET /notifications/stats`, `POST /notifications/test`, `POST /notifications/test-email`, `POST /notifications/test-payment-reminder`, `POST /notifications/test-overdue`, `POST /notifications/test-receipt` | Notification management and test endpoints |

Most protected routes require a Bearer JWT token (see Swagger docs for details on each endpoint's request/response schema).

## License

This project is marked `UNLICENSED` in `package.json` — all rights reserved unless stated otherwise by the author.
