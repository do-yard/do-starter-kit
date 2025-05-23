# 💻 Development Guide

This guide provides detailed instructions for developers working with the DigitalOcean SaaS Starter Kit.

## Prerequisites

Before you begin development:

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) for local database
- DigitalOcean account (for Spaces storage)
- Git

## Development Environment Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/ajot/do-starter-kit
cd do-starter-kit/application
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Copy the example environment file:

```bash
copy env-example .env  # on Windows
# or
cp env-example .env    # on Mac/Linux
```

Edit the `.env` file with your specific configuration:

1. **Database Configuration**:
   - See [database.md](./database.md) for detailed instructions
   - For local development, the Docker Compose setup will handle this for you

2. **Authentication Settings**:
   - Generate a strong `NEXTAUTH_SECRET` (use [Password Generator](https://passwords-generator.org/))
   - Set `NEXTAUTH_URL` to your development URL (usually `http://localhost:3000`)

3. **DigitalOcean Spaces Configuration**:
   - Follow the instructions in [Storage.md](./Storage.md) to set up your Spaces bucket
   - Add your access key, secret, bucket name, and region

### Step 4: Set Up the Database

Start the local PostgreSQL database using Docker:

```bash
docker-compose up -d
```

Initialize Prisma and run migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

### Step 5: Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Workflow

### Code Organization

Follow the project structure outlined in [project-structure.md](./project-structure.md).

### Adding New Features

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Adding a new API endpoint**:
   - Create a new folder under `src/app/api/`
   - Implement your route handler in a `route.ts` file
   - Add tests in a corresponding `route.test.ts` file

3. **Adding a new page**:
   - Create a new folder under `src/app/(protected)/` or `src/app/(public)/` depending on authentication requirements
   - Implement your page in a `page.tsx` file

4. **Adding a new component**:
   - Add components under the appropriate directory in `src/components/`
   - Include tests for your component

### Working with the Database

1. **Modifying the schema**:
   - Edit `prisma/schema.prisma` with your changes
   - Generate a migration:
     ```bash
     npx prisma migrate dev --name describe_your_changes
     ```

2. **Using Prisma Client**:
   - Import the client from `src/lib/prisma.ts`
   - Use the client to interact with your database

### File Storage

For file uploads and storage:
1. Make sure your DigitalOcean Spaces is configured (see [Storage.md](./Storage.md))
2. Use the storage service from `src/services/storage/spacesStorageService.ts`

## Code Style and Linting

This project uses ESLint to enforce code style and best practices:

```bash
npm run lint        # Check for linting issues
npm run lint:fix    # Automatically fix linting issues
```

## Live Reloading

The development server supports hot reloading. Most changes will be reflected in the browser automatically when you save files.

## Environment Switching

To use different environments (development, staging, production), create separate `.env` files:

- `.env.development` - Development settings
- `.env.production` - Production settings

## Troubleshooting

If you encounter issues during development, here are solutions to common problems:

### Database Connection Issues

1. **Connection refused errors**:
   - Check that Docker is running with `docker ps`
   - Verify your database connection string in `.env`
   - Default connection string: `postgresql://postgres:postgres@localhost:5432/saas_kit_db`

2. **Database doesn't exist**:
   ```
   Error: P1003: Database "saas_kit_db" does not exist
   ```
   - Reset your Docker container: `docker-compose down -v && docker-compose up -d`
   - Create the database manually: `docker exec -it app-db psql -U postgres -c "CREATE DATABASE saas_kit_db;"`

### Prisma Errors

1. **Schema changes not reflected**:
   - Run `npx prisma generate` after any schema changes
   - Make sure migrations are applied with `npx prisma migrate deploy`
   - For development, use `npx prisma migrate dev --name describe_your_changes`

2. **Type errors with Prisma client**:
   ```
   Property 'X' does not exist on type 'Y'
   ```
   - Run `npx prisma generate` to update TypeScript definitions
   - Check for typos in your model references

### Next.js Development Issues

1. **Hot reloading not working**:
   - Check for syntax errors in your code
   - Restart the development server
   - Clear your browser cache

2. **API routes returning 500 errors**:
   - Check the terminal for error logs
   - Verify your environment variables
   - Test API routes using tools like Postman or Thunder Client

### File Upload Issues

1. **Upload failures**:
   - Verify your Spaces credentials in `.env`
   - Check permissions on your Spaces bucket
   - For local testing, configure `STORAGE_PROVIDER=local` to use local storage

2. **Missing files**:
   - Check for CORS issues if uploading from browser
   - Verify file paths are correct
   - Check disk space if using local storage

### Environment Issues

1. **Missing environment variables**:
   - Ensure you've copied `env-example` to `.env` and filled all required values
   - Check for typos in variable names
   - Restart your development server after changing environment variables

For additional help, check the project issues on GitHub or submit a new issue.
