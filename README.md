# DigitalOcean SaaS Starter Kit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)](https://www.prisma.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payment-6772e5)](https://stripe.com/)
[![Resend](https://img.shields.io/badge/Resend-Email-24292F)](https://resend.com/)
[![DigitalOcean](https://img.shields.io/badge/DigitalOcean-Ready-0080FF)](https://www.digitalocean.com/)
[![DO Spaces](https://img.shields.io/badge/DO%20Spaces-Storage-0080FF)](https://www.digitalocean.com/products/spaces/)

This repository contains a complete SaaS Starter Kit for building professional SaaS applications on DigitalOcean App Platform.

Welcome! 👋 This starter kit helps you quickly build and deploy a professional SaaS application. It's designed to get you up and running fast, whether you're developing locally or connecting to a cloud database.

## Quick Deploy

Want to try it out right away? Deploy directly to DigitalOcean App Platform with one click:

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/do-yard/do-starter-kit/tree/main)

## What's Included

This is a production-ready SaaS Starter Kit for developers who want to build and launch real products quickly. It includes:

- 🔐 User authentication and accounts (Next-Auth with email/password)
- 💳 Subscription management (Stripe integration)
- 📧 Email system (Resend.com integration)
- 🖼️ File uploads and storage (DigitalOcean Spaces)
- 🗄️ Database integration (DigitalOcean PostgreSQL)
- 🚀 One-click deploy to DigitalOcean App Platform
- 📊 User dashboard
- ✨ Modern, responsive UI (Next.js, React, Material UI)

Developers can use this kit as a clean, flexible starting point for your own SaaS app — or as a reference app to see how all the core pieces fit together on DigitalOcean.

It shows how real-world features are implemented using DO services. It also works really well with tools like ChatGPT or Claude. You can literally point your LLM at this repo and say:

"Build me something like this, but for [my idea]," and it'll scaffold your app using similar patterns — auth, billing, storage, GenAI, etc., all running on DigitalOcean.

## Technical Stack

![Architecture Diagram](./docs/images/do-architecture-diagram.drawio.png)

- **Frontend**: Next.js, React, Material UI
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: Next-Auth
- **Email**: Resend.com
- **File Storage**: DigitalOcean Spaces
- **Payments**: Stripe
- **Deployment**: DigitalOcean App Platform

## Who It's For

- Indie hackers
- Solo devs
- Early-stage startup teams
- Developers validating an idea
- Anyone looking to build fast with best practices baked in

## Get Started

The DigitalOcean SaaS Starter Kit can be run [locally](#quick-start-local-development) or on [DigitalOcean App Platform](#part-5-deploy-to-digitalocean-app-platform). Follow the steps for each case below.

> **Important**: The app works out of the box with basic authentication and signup. However, to enable full functionality:
>
> - Email features (verification emails, password reset, magic links) require [Resend configuration](#part-2-set-up-email-provider-resend)
> - File uploads require [DigitalOcean Spaces setup](#part-3-set-up-file-storage-digitalocean-spaces)
> - Subscription features require [Stripe configuration](#part-4-set-up-stripe-for-billing-and-subscriptions)

## Quick Start (Local Development)

### Step 1: Get the Code

Clone the repository and install dependencies:

```bash
git clone https://github.com/do-yard/do-starter-kit.git
cd do-starter-kit/application
npm install
```

### Step 2: Set Up Your Database

#### Option A: Use Docker for PostgreSQL (Recommended for Development)

If you prefer using Docker for your database, follow these steps:

1. **Install Docker**

   - If you don't already have Docker installed, download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
   - Make sure Docker is running on your system before proceeding

2. **Define Environment Variables**

   Create or update your `.env` file inside the `application/` directory:

   ```
   # Local application database configuration
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/saas_kit_db

   # Docker container initialization (PostgreSQL)
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=postgres
   POSTGRES_DB=saas_kit_db
   ```

   > **Note:** The `DATABASE_URL` is used by your application, while the `POSTGRES_*` variables configure the Docker PostgreSQL instance. Keep them aligned to avoid mismatches.

3. **Start the PostgreSQL Container**

   From the project root, run:

   ```bash
   cd application
   docker-compose up -d
   ```

   This will start a PostgreSQL container with the following defaults:

   - Port: 5432
   - User: postgres
   - Password: postgres
   - Database: saas_kit_db

4. **Initialize Your Database**

   With the Docker container running, set up your database tables:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

#### Option B: Use an Existing Cloud Database (e.g., DigitalOcean)

If you already have a PostgreSQL database hosted in the cloud, you can use that instead:

- [How to create a DigitalOcean database](./docs/creating-database-digitalocean.md)
- [How to get your DigitalOcean database connection string](https://docs.digitalocean.com/products/databases/postgresql/how-to/connect/)

### Step 3: Environment Setup

- Copy the example environment file:

  ```bash
  cp env-example .env
  ```

- Edit `.env` and set your `DATABASE_URL`:

  - If running locally, use the value from the Docker setup above.
  - If using a cloud database, paste your connection string here.

### Step 4: Initialize Your Database

Run the following to set up your database tables:

```bash
npx prisma generate
npx prisma migrate deploy
```

### Step 5: Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## First Things to Try

The basic starter kit is now set up locally on your computer! You can start exploring and playing around with the app right away:

1. **Sign up** for a new account

   - Fill in your email and password
   - After submitting, you'll see a confirmation message directly on the webpage (not via email)

2. **Log in** with your new credentials

   - You'll see a dashboard. This starter kit is built as a simple note-taking app, so you can:
     - **Create notes** (this is the main business logic included)
     - Edit or delete your notes
   - Try toggling **dark mode/light mode**
   - Go to your **profile** and try updating your profile details
   - **Log out** and log back in

3. **Check the System Status Page**
   - Navigate to [http://localhost:3000/system-status](http://localhost:3000/system-status) to see if all required services are correctly configured
   - We've built this helpful service status page to show you at a glance if any service (like email or file storage) is misconfigured or missing credentials
   - This makes it easy to spot and fix issues before going live

> **Note:** Email and file storage are not set up by default. Configure these features using the documentation below.

## Part 2: Set Up Email Provider (Resend)

By default, email functionality is disabled for local development, allowing you to sign up and log in without setting up an email provider. However, features like password reset and magic links won't work until email is configured.

This starter kit comes with Resend integration built-in. All you need to do is get your API key and a verified sender email address from Resend, and add them to your `.env` file.

### Steps:

1. **Create a Resend Account**

   - Go to [Resend](https://resend.com/) and sign up for a free account

2. **Get Your API Key**

   - In the Resend dashboard, go to the [API Keys](https://resend.com/api-keys) section
   - Click "Create API Key" and copy the generated key
   - Set permissions to "Full Access" and select your domain (or all domains)
   - Store this key securely - you'll need it for your `.env` file

3. **Configure Sender Address (Two Options)**

   **Option A: Use Resend Test Address (Quick Start)**

   - Use `delivered@resend.dev` as your sender address
   - Note: This only allows sending emails to the account that created the API key
   - Perfect for initial testing but not for production use

   **Option B: Add and Verify Your Own Domain (Recommended for Production)**

   - In the Resend dashboard, go to the [Domains](https://resend.com/domains) section
   - Click "Add Domain" and enter your domain name
   - Follow the DNS verification steps provided to verify ownership of your domain
   - Once verified, you can use any email address at that domain as your sender (e.g., `noreply@yourdomain.com`)
   - Note: Free accounts can configure up to one domain

4. **Update Your `.env` File**
   Add these lines (replace with your actual values):

   ```
   ENABLE_EMAIL_INTEGRATION=true
   RESEND_API_KEY=your-resend-api-key
   RESEND_EMAIL_SENDER=delivered@resend.dev  # Or your verified domain email
   ```

5. **Restart Your Development Server**

   - After updating your `.env`, restart the server:

     ```bash
     npm run dev
     ```

6. **Test Email Sending**

   - Try signing up for a new account or using the password reset feature
   - Check your inbox for the verification or reset email
   - You can also check the system status page to confirm Resend is connected

## Part 3: Set Up File Storage (DigitalOcean Spaces)

Most SaaS apps need a way to store user files—like profile images, uploads, or documents. This starter kit uses DigitalOcean Spaces for file storage, which is a scalable, S3-compatible solution. For example, the profile image feature in this kit is designed to work with a Spaces bucket out of the box.

To enable file uploads, you'll need to set up a DigitalOcean Spaces bucket and add your credentials to your `.env` file.

### Steps:

1. **Create a Spaces Bucket**
   - Log in to your [DigitalOcean dashboard](https://cloud.digitalocean.com/spaces)
   - Click "Create a Space"
   - Choose a datacenter region and give your Space a unique name
2. **Create an Access Key**

   - In your DigitalOcean dashboard, go to the **Settings** for the Spaces bucket you just created
   - Find the section for **Access Keys** and click **Create Access Key**
   - Choose **Limited Access** and select your bucket (e.g., `do-starter-kit-demo`)
   - Set the permissions to **Read/Write/Delete**
   - Give your access key a name (e.g., `do-starter-kit-demo-access-key`)
   - Click **Create Access Key**
   - Save the **Access Key** and **Secret Key** somewhere safe—you'll need them for your `.env` file

![Creating Access Key in DigitalOcean](./docs/images/create_access_key_digitalocean.png)

3. **Get Your Spaces Values for Environment Variables**

   After creating your Spaces bucket and access key, you'll need to add the following values to your `.env` file:

   - **SPACES_REGION**: This is your selected datacenter region (e.g., nyc3, sfo2, etc.)

   - **SPACES_BUCKET_NAME**: This is simply the name you gave your Spaces bucket when you created it

   - **SPACES_KEY_ID**: This is the Access Key ID you received when creating your access key

   - **SPACES_SECRET_KEY**: This is the Secret Access Key you received when creating your access key

   The image below shows where to find the Access Key ID and Secret Access Key values after creating them:

![Access Key Information](./docs/images/access_key_information_screenshot.png)

4. **Update Your `.env` File**
   Add these lines (replace with your actual values):

   ```
   SPACES_REGION=your-space-region (nyc3, sfo2, etc.)
   SPACES_BUCKET_NAME=your-space-name
   SPACES_SECRET_KEY=your-access-key
   SPACES_SECRET=your-secret-key
   ```

   - The endpoint will match your region (e.g., `nyc3`, `sfo2`, etc.)

5. **Restart Your Development Server**

   - After updating your `.env`, restart the server:

     ```bash
     npm run dev
     ```

6. **Check the System Status Page**

   - After setting up your Spaces credentials, visit [http://localhost:3000/system-status](http://localhost:3000/system-status) to confirm that file storage is correctly configured and connected

7. **Try Uploading a Profile Image**

   - Go to your profile/settings page in the app
   - Try uploading a profile image to make sure everything is working as expected
   - If you encounter any errors, check the system status page for more details and troubleshooting tips

> For more details, see [DigitalOcean's Spaces documentation](https://docs.digitalocean.com/products/spaces/).

## Part 4: Set Up Stripe for Billing and Subscriptions

This starter kit includes a complete subscription billing system powered by Stripe. Setting up Stripe allows you to:

- Offer free and paid subscription tiers
- Process payments securely
- Let users manage their subscriptions
- Handle subscription lifecycle events automatically

### Quick Setup Steps:

1. **Create a Stripe Account**

   - Sign up for a free account at [Stripe](https://dashboard.stripe.com/register)

2. **Get Your API Keys**

   - In your Stripe dashboard, switch to Test mode
   - Go to Developers → API keys
   - Copy your Secret Key (starts with `sk_test_...`)

3. **Run the Automated Setup Script**

   ```bash
   npm run setup:stripe
   ```

   This script will:

   - Create subscription products (Free and Pro plans)
   - Set up pricing tiers
   - Configure the customer portal
   - Add all necessary keys to your `.env` file

4. **Configure Webhooks**

   - For local development, use the Stripe CLI (recommended) or ngrok
   - For production, set up webhooks in your Stripe dashboard

5. **Test the Integration**

   - Try signing up for a paid plan
   - Test upgrading/downgrading subscriptions
   - Verify subscription status changes are reflected in your app

> **Note:** For detailed instructions, including webhook setup, adding custom products, and troubleshooting, see the [Stripe Integration Guide](./docs/stripe-integration-guide.md).

## Part 5: Deploy to DigitalOcean App Platform

This starter kit is designed to deploy seamlessly to DigitalOcean App Platform. You have two options for deployment:

### Option A: Deploy with One-Click Deployment Button

1. Click on the one-click deployment button below. If you are not currently logged in with your DigitalOcean account, this button prompts you to log in.

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/do-yard/do-starter-kit/tree/main)

2. After deployment is complete, configure the environment variables under Settings -> saas-application.
   - DATABASE_URL: is automatically populated, but if you want to use a DigitalOcean Managed DB, replace the connection string value.

> Note: Prisma migrations will run automatically

3. Navigate to the site to verify your deployment

### Option B: Manual Deployment

1. **Prepare Your Application**

   - Make sure all required environment variables are set
   - Ensure your database is properly configured
   - Test your application locally to confirm everything works

2. **Deploy to DigitalOcean**

   - Follow the detailed instructions in our [DigitalOcean Deployment Guide](docs/digitalocean-deployment-guide.md)
   - The guide covers creating resources, configuring environment variables, and setting up your app

3. **Verify Your Deployment**
   - After deployment, check the system status page on your live site
   - Test all features to ensure they're working correctly in production

For detailed deployment instructions, see the [DigitalOcean Deployment Guide](docs/digitalocean-deployment-guide.md).

## License

This repository is covered under [The MIT License](LICENSE).
