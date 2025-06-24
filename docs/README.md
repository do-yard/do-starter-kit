# SaaS Starter Kit (Simplified Onboarding)

## Introduction

Welcome! 👋 This starter kit helps you quickly build and deploy a professional SaaS application. It's designed to get you up and running fast, whether you're developing locally or connecting to a cloud database.

## What's Included

- 🔐 User authentication and accounts
- 💳 Subscription management (Stripe-ready)
- 📧 Email system (configurable)
- 🖼️ File uploads and storage (configurable)
- 📊 User dashboard
- ✨ Modern, responsive UI

## Quick Start (Local Development)

### 1. Get the Code

Clone the repository and install dependencies:

```bash
git clone https://github.com/do-yard/do-starter-kit.git
cd do-starter-kit/application
npm install
```

### 2. Set Up Your Database

#### Option A: Local PostgreSQL (Recommended for Development)

- Make sure you have PostgreSQL installed on your machine.

- Use the provided script to create a user and database:

  ```bash
  chmod +x create_pg_user_and_db.sh
  ./create_pg_user_and_db.sh
  ```

- This will print a `DATABASE_URL` you can use in your environment file.

#### Option B: Use an Existing Cloud Database (e.g., DigitalOcean)

- If you already have a PostgreSQL database hosted in the cloud, copy your connection string.
- [How to get your DigitalOcean database connection string](https://docs.digitalocean.com/products/databases/postgresql/how-to/connect/)

**Creating a New PostgreSQL Database on DigitalOcean:**

1. **Log in to DigitalOcean**
   - Go to [DigitalOcean Control Panel](https://cloud.digitalocean.com/login)
   - Sign in with your account credentials

2. **Create a New Database**
   - Click on **Databases** in the left sidebar
   - Click the **Create Database Cluster** button
   - Select **PostgreSQL** as the database engine

3. **Choose Configuration**
   - Select a plan (e.g., **Basic** or **Professional**)
   - Choose resources (e.g., **Regular CPU, 1 vCPU, 1GB RAM** for development)
   - Select a data center region (e.g., **New York**)
   - Give your database a name (e.g., **saas-starter-db**)
   - Click **Create Database Cluster**

4. **Get Connection Details**
   - Wait for the database to be provisioned (usually takes a few minutes)
   - Once created, click on your new database from the list
   - Under the **Connection Details** section, find the connection string
   - Select **Connection parameters** and copy the **Connection string**
   - This string will look something like: `postgresql://doadmin:password@db-postgresql-nyc1-12345.db.ondigitalocean.com:25060/defaultdb?sslmode=require`

5. **Configure Firewall (Optional)**
   - If you need to restrict access, click on **Settings** and then **Trusted Sources**
   - Add the IP addresses that should have access to your database

> **Note:** The smallest database size (1GB RAM) is sufficient for development and testing. For production, consider using at least 2GB RAM depending on your expected load.

#### Option C: Use Docker for PostgreSQL

If you prefer using Docker for your database, follow these steps:

1. **Define Environment Variables**

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

2. **Start the PostgreSQL Container**

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

3. **Initialize Your Database**

   With the Docker container running, set up your database tables:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### 3. Environment Setup

- Copy the example environment file:

  ```bash
  cp .env.example .env
  ```

- Edit `.env` and set your `DATABASE_URL`:

  - If running locally, use the value from the setup script.
  - If using a cloud database, paste your connection string here.

### 4. Initialize Your Database

Run the following to set up your database tables:
    `npx prisma generate`
    `npx prisma migrate deploy`

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## First Things to Try

The basic starter kit is now set up locally on your computer! You can start exploring and playing around with the app right away:

- **Sign up** for a new account.
  - Fill in your email and password.
  - After submitting, you'll see a confirmation message directly on the webpage (not via email).
- **Log in** with your new credentials.
- You'll see a dashboard. This starter kit is built as a simple note-taking app, so you can:
  - **Create notes** (this is the main business logic included)
  - Edit or delete your notes
  - Try toggling **dark mode/light mode**
  - Go to your **profile** and try updating your profile details
  - **Log out** and log back in

- **Check the System Status Page**
  - Navigate to [http://localhost:3000/system-status](http://localhost:3000/system-status) to see if all required services are correctly configured.
  - We've built this helpful service status page to show you at a glance if any service (like email or file storage) is misconfigured or missing credentials. This makes it easy to spot and fix issues before going live.

> **Note:** Profile image upload will not work until you set up a Spaces bucket for file storage. See the [Set Up File Storage (DigitalOcean Spaces)](#part-2-set-up-file-storage-digitalocean-spaces) section below for instructions.
>
> Email and file storage are not set up by default. You won't receive verification emails or be able to upload files until you configure these features. See the documentation for setup instructions.

---

## Part 2: Set Up File Storage (DigitalOcean Spaces)

Most SaaS apps need a way to store user files—like profile images, uploads, or documents. This starter kit uses DigitalOcean Spaces for file storage, which is a scalable, S3-compatible solution. For example, the profile image feature in this kit is designed to work with a Spaces bucket out of the box.

To enable file uploads, you'll need to set up a DigitalOcean Spaces bucket and add your credentials to your `.env` file.

### Steps:

1. **Create a Spaces Bucket**

   - Log in to your [DigitalOcean dashboard](https://cloud.digitalocean.com/spaces).
   - Click "Create a Space."
   - Choose a datacenter region and give your Space a unique name.

2. **Create an Access Key**

   - In your DigitalOcean dashboard, go to the **Settings** for the Spaces bucket you just created.
   - Find the section for **Access Keys** and click **Create Access Key**.
   - Choose **Limited Access** and select your bucket (e.g., `do-starter-kit-demo`).
   - Set the permissions to **Read/Write/Delete**.
   - Give your access key a name (e.g., `do-starter-kit-demo-access-key`).
   - Click **Create Access Key**.
   - Save the **Access Key** and **Secret Key** somewhere safe—you'll need them for your `.env` file.

![alt text](<images/create_access_key_digitalocean.png>)

3. **Get Your Spaces Values for Environment Variables**

   After creating your Spaces bucket and access key, you'll need to add the following values to your `.env` file:
   
   - **SPACES_ENDPOINT**: This is the regional endpoint URL for your Spaces bucket. It follows the format `https://REGION.digitaloceanspaces.com` where REGION is your selected datacenter region (e.g., nyc3, sfo2, etc.)
   
   - **SPACES_BUCKET**: This is simply the name you gave your Spaces bucket when you created it.
   
   - **SPACES_KEY**: This is the Access Key ID you received when creating your access key.
   
   - **SPACES_SECRET**: This is the Secret Access Key you received when creating your access key.
   
   The image below shows where to find the Access Key ID and Secret Access Key values after creating them:

![Access Key Information](<images/access_key_information_screenshot.png>)

4. **Update Your `.env` File**
   Add these lines (replace with your actual values):

   ```
   SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
   SPACES_BUCKET=your-space-name
   SPACES_KEY=your-access-key
   SPACES_SECRET=your-secret-key
   ```

   - The endpoint will match your region (e.g., `nyc3`, `sfo2`, etc.).

5. **Restart Your Development Server**

   - After updating your `.env`, restart the server:

     ```bash
     npm run dev
     ```

6. **Check the System Status Page**

   - After setting up your Spaces credentials, visit [http://localhost:3000/system-status](http://localhost:3000/system-status) to confirm that file storage is correctly configured and connected.

7. **Try Uploading a Profile Image**

   - Go to your profile/settings page in the app.
   - Try uploading a profile image to make sure everything is working as expected.
   - If you encounter any errors, check the system status page for more details and troubleshooting tips.

> For more details, see [DigitalOcean's Spaces documentation](https://docs.digitalocean.com/products/spaces/).

---

## Part 3: Set Up Email Provider (Resend)

By default, email verification is turned off for local development, so you can sign up and log in without setting up email. However, email verification is a standard security feature for any SaaS app, and you should enable it before going live.

This starter kit comes with Resend integration built-in. All you need to do is get your API key and a verified sender email address from Resend, and add them to your `.env` file.

### Steps:

1. **Create a Resend Account**

   - Go to [Resend](https://resend.com/) and sign up for a free account.

2. **Get Your API Key**

   - In the Resend dashboard, go to the [API Keys](https://resend.com/api-keys) section.
   - Click "Create API Key" and copy the generated key.
   - Set permissions to "Full Access" and select your domain (or all domains).
   - Store this key securely - you'll need it for your `.env` file.

3. **Configure Sender Address (Two Options)**

   **Option A: Use Resend Test Address (Quick Start)**
   - Use `delivered@resend.dev` as your sender address
   - Note: This only allows sending emails to the account that created the API key
   - Perfect for initial testing but not for production use

   **Option B: Add and Verify Your Own Domain (Recommended for Production)**
   - In the Resend dashboard, go to the [Domains](https://resend.com/domains) section.
   - Click "Add Domain" and enter your domain name.
   - Follow the DNS verification steps provided to verify ownership of your domain.
   - Once verified, you can use any email address at that domain as your sender (e.g., `noreply@yourdomain.com`).
   - Note: Free accounts can configure up to one domain.

4. **Update Your `.env` File**
   Add these lines (replace with your actual values):

   ```
   RESEND_API_KEY=your-resend-api-key
   RESEND_EMAIL_SENDER=delivered@resend.dev  # Or your verified domain email
   ```

5. **Restart Your Development Server**

   - After updating your `.env`, restart the server:

     ```bash
     npm run dev
     ```

6. **Test Email Sending**

   - Try signing up for a new account or using the password reset feature.
   - Check your inbox for the verification or reset email.
   - You can also check the system status page to confirm Resend is connected.

> For more advanced features and integrations, check out the full documentation in the `docs/` directory. 

---

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

> **Note:** For detailed instructions, including webhook setup, adding custom products, and troubleshooting, see the [Stripe Setup Guide](new-docs/new-stripe-setup.md).

---



Once that works, then I can move to the second part, which is connecting to a DigitalOcean database with the updated ENV files, running Prisma, everything again, and then it would be deploying it. 