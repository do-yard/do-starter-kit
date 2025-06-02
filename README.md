# DigitalOcean SaaS Starter Kit

This repository contains a complete SaaS starter kit for building professional SaaS applications on DigitalOcean App Platform.

**Note**: Following these steps may result in charges for the use of DigitalOcean services.

## Architecture Overview

![Architecture Diagram](./docs/images/do-architecture-diagram.drawio.png)

The architecture diagram above shows the complete structure of the SaaS Starter Kit, including how components interact with DigitalOcean services.

## Get Started

This guide describes how to use DigitalOcean App Platform to deploy a complete SaaS application with:

- User authentication
- Database integration
- API endpoints
- File storage
- Subscription billing

### Requirements

- You need a DigitalOcean account. If you do not already have one, first [sign up](https://cloud.digitalocean.com/registrations/new).
- You must create a DigitalOcean Space (object storage) manually for file uploads. See [Storage setup instructions](./docs/storage.md).
- For local development, you need Docker installed (or access to a Postgres database).

## Deploy the App

Click the following button to deploy the app to App Platform. If you are not currently logged in with your DigitalOcean account, this button prompts you to log in.

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/ajot/do-starter-kit/tree/main)

To enable automatic redeployment or to modify the code, we recommend you fork this repository:

1. Click the **Fork** button in the top-right of [this GitHub repository](https://github.com/ajot/do-starter-kit), then follow the on-screen instructions
2. In your forked repo, the README will display as `https://github.com/<your-org>/do-starter-kit`
3. To deploy your fork, visit the [App Platform control panel](https://cloud.digitalocean.com/apps) and click **Create App**
4. Select **GitHub** as your service provider, select your forked repo, and ensure the main branch is selected with **Autodeploy** enabled
5. Click **Next**

After clicking the Deploy button or setting up your fork, follow these steps:

1. **Configure environment variables and database:**
   - Set up the required environment variables (see [Environment Variables](#environment-variables) below)
2. **Deploy your application:**

   - Provide a name for your app and select a region
   - Review settings and click **Launch Basic/Pro App**

3. **Complete post-deployment setup:**
   - After the build completes, use the App Platform Console to run database migrations:
     ```bash
     npx prisma generate
     npx prisma migrate deploy
     ```
4. **Access your application:**
   - Click the **Live App** link in the header to see your running SaaS application

## Environment Variables

The following environment variables are required:

1. **Database Environment Variables**:

   ```
   DATABASE_URL=postgres://username:password@host:port/database
   ```

   - This will be automatically configured if you create a DigitalOcean Managed Database
   - For details on setting up the database, see the [Database Guide](./docs/database.md).

2. **NextAuth Environment Variables**:

   ```
   NEXTAUTH_URL=https://your-app-name.ondigitalocean.app
   NEXTAUTH_SECRET=your-secure-random-string
   ```

   - Generate a secure random string for `NEXTAUTH_SECRET` using a tool like [Password Generator](https://passwords-generator.org/)
   - `NEXTAUTH_URL` should be your app's full URL (will be available after first deployment)

3. **DigitalOcean Spaces Environment Variables**:

   ```
   SPACES_KEY=your-spaces-access-key
   SPACES_SECRET=your-spaces-secret-key
   SPACES_ENDPOINT=your-region.digitaloceanspaces.com
   SPACES_BUCKET=your-bucket-name
   ```

   - Get these values from your DigitalOcean Spaces setup (see [storage.md](./docs/storage.md))

4. **Stripe Environment Variables**
   ```
   NEXT_PUBLIC_STRIPE_FREE_PRODUCT_ID
   NEXT_PUBLIC_STRIPE_FREE_PRICE_ID
   NEXT_PUBLIC_STRIPE_PRO_PRODUCT_ID
   NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
   ```
   - Get these values from your Stripe setup (see [stripe-setup.md](./docs/stripe-setup.md))

## Local Development

To run the application locally:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/ajot/do-starter-kit
   cd application
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp env-example .env
   ```

4. **Start the database:**

   ```bash
   docker-compose up -d
   ```

5. **Run database migrations:**

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

6. **Start the development server:**

   ```bash
   npm run dev
   ```

7. **Open your browser** at [http://localhost:3000](http://localhost:3000)

For detailed development instructions, see our [Development Guide](./docs/development-guide.md).

## Make Changes to Your App

If you forked this repository, you can now make changes to your copy of the starter kit. Pushing changes to the main branch will automatically redeploy your app on App Platform with zero downtime.

To understand the project structure and make effective changes:

1. Review the [Project Structure Guide](./docs/project-structure.md) to understand the codebase
2. Follow the [Development Guide](./docs/development-guide.md) for best practices
3. Consult the [Tech Stack Guide](./docs/tech-stack.md) for details on included technologies

## Learn More

For detailed documentation on all aspects of this starter kit:

- **[Project Structure](./docs/project-structure.md)** - Codebase organization
- **[Tech Stack](./docs/tech-stack.md)** - Technologies used
- **[Development Guide](./docs/development-guide.md)** - Local development workflow
- **[Database Guide](./docs/database.md)** - Database setup and management
- **[Storage Guide](./docs/storage.md)** - DigitalOcean Spaces configuration
- **[Stripe Setup](./docs/stripe-setup.md)** - Stripe setup and configuration
- **[Stripe Webhooks](./docs/stripe-webhooks.md)** Stripe Webhooks setup

To learn more about App Platform and how to manage your applications, see [DigitalOcean App Platform documentation](https://www.digitalocean.com/docs/app-platform/).

## Delete the App

When you no longer need this application running live, you can delete it by following these steps:

1. Visit the [Apps control panel](https://cloud.digitalocean.com/apps)
2. Navigate to your SaaS application
3. In the **Settings** tab, click **Destroy**

**Note**: If you do not delete your app, charges for using DigitalOcean services will continue to accrue.

## Continues Integration and Development environments

Dedicated workflows to validate code quality and provision development deployments in DigitalOcean App Platform are available. Learn more in [Workflows Documentation](/docs/workflows.md)

## License

This repository is covered under [The MIT License](LICENSE).
