# DigitalOcean SaaS Starter Kit

This repository contains a complete SaaS starter kit for building professional SaaS applications on DigitalOcean App Platform.

**Note**: Following these steps may result in charges for the use of DigitalOcean services.

## Architecture Overview

![Architecture Diagram](./docs/images/do-architecture-diagram.drawio.png)

The architecture diagram above shows the complete structure of the SaaS Starter Kit, including how components interact with DigitalOcean services.

## Get Started

The DigitalOcean SaaS Starter Kit can be run [locally](#running-locally) or in [DigitalOcean platform](#deploy-to-digitalocean-platform). Follow the steps for each case below.

## Running locally

1. Download/clone the repo.
1. Navigate to \application folder
1. Run `npm install`
1. Copy .env file with `cp env-example .env`
1. Complete at minimum 'Database configuration' and 'Auth.js configuration' settings sections. Postgres DB can be a local instance or a Managed Database in DigitalOcean platform. Either way, the Postgres connection string is used in for connection.
1. Run Prisma generate: `npx prisma generate`
1. Run Prisma migration: `npx prisma migrate deploy`
1. Start the site: `npm run dev`

If you made changes to the repo and want to deploy them to DigitalOcean, navigate to the [Deploy from local environment](#deploy-from-local-environment) section.

## Deploy to DigitalOcean platform

1. Click on the one-click deployment button below. If you are not currently logged in with your DigitalOcean account, this button prompts you to log in.

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/do-yard/do-starter-kit/tree/main)

2. After deployment is complete, configure the environment variables under Settings -> saas-application.
   - DATABASE_URL: is automatically populated, but if you want to use a DigitalOcean Managed DB, replace the connection string value.
   - NEXTAUTH_URL: URL of the site
   - NEXTAUTH_SECRET: random string for authentication. After setting a value, check the encrypt box.
3. Run Prisma migrations:
   - Go to Console, in the DigitalOcean dashboard
   - Run `npx prisma migrate deploy` command
4. Navigate to the site

## Configure DigitalOcean Spaces storage

DigitalOcean Spaces Storage is necessary to upload profile pictures. If you want to use this feature, you can find the configuration steps in the [DigitalOcean Spaces Storage Setup](./docs/storage.md) article.

## Postgres DB options

There are three Postgres DB options.

### DigitalOcean Managed

To use a DigitalOcean Managed DB, replace the connection string value in the environment variable DATABASE_URL with you DB connection string. For info on Managed Databases please navigate to [Managed Databases](https://docs.digitalocean.com/products/databases/) official documentation.

### Dev provisioned

The one-click deploy button automatically creates and configures a development Postgres DB that is attached to the application. If you wish to connect to the DB locally follow the guide below:

**Prerequisites**

- Access to your DigitalOcean project
- Your **public IP address**

**Whitelist IP for Access**

1. **Generate API Token**

   - Visit [DigitalOcean API Tokens](https://cloud.digitalocean.com/account/api/tokens)
   - Create a new token and **store it securely**

2. **Get Database ID**

   - Navigate to your app on the [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Find the database under “Settings” > “Components”

3. **Update Firewall Rules**

Replace values accordingly:

```bash
curl -X PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DIGITALOCEAN_TOKEN" \
  -d '{"rules": [{"type": "ip_addr", "value": "YOUR_PUBLIC_IP"}]}' \
  "https://api.digitalocean.com/v2/databases/YOUR_DATABASE_ID/firewall"
```

### Docker instance

If you wish to use a Postgres Docker instance follow the steps below.

**Step 1: Define Environment Variables**

Create a `.env` file inside the `application/` directory:

```dotenv
# Local application database configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Docker container initialization (PostgreSQL)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=saas_kit_db
```

> ℹ️ The `DATABASE_URL` is used by your application, while the `POSTGRES_*` variables configure the Docker PostgreSQL instance. Keep them aligned to avoid mismatches.

**Step 2: Start the PostgreSQL Container**

From the project root, run:

```bash
cd application
docker-compose up -d
```

Defaults used:

- Port: `5432`
- User: `postgres`
- Password: `postgres`
- Database: `saas_kit_db`

**Step 4: Run the App**

```bash
npm run dev
```

**Step 5: Check system status**
Navigate to the `/system-status` page to see if all the required services are correctly configured.

## Deploy from local environment

If you made changes to the Starter Kit and want to deploy them to DigitalOcean:

1. Upload the repo to GitHub or push the changes if created a fork of the original DigitalOcean repo.
1. Create an **app.yaml** file by copying **app.template.yaml**.
1. **Important**: settings from .env file do not transfer automatically to the **app.yaml**, they have to be copied manually. Also, there are a few other values to complete in the YAML. The following is a checklist with all placeholders:
   - [ ] **APP_NAME**: arbitrary name for your app.
   - [ ] **repo**: replace _do-yard/do-starter-kit_ with your GitHub username and repo name.
   - [ ] **GITHUB_BRANCH**: the branch you want to deploy.
   - [ ] **DB_NAME**: arbitrary name for your database.
   - [ ] **SPACES_KEY_ID**: id of an existing Spaces storage key.
   - [ ] **SPACES_KEY_SECRET**: secret of an existing Spaces storage key.
   - [ ] **SPACES_BUCKET_NAME**: name of an existing bucket.
   - [ ] **SPACES_REGION**: bucket region.
   - [ ] **NEXTAUTH_SECRET**: arbitrary string for Auth.js.
   - [ ] **APP_URL**: URL of the site, can be obtained after the site is deployed. You can leave it blank before deployment.
   - [ ] **RESEND_API_KEY**: Your Resend API key. This feature is WIP.
   - [ ] **RESEND_EMAIL_SENDER**: Sender address for the emails that the app will send. This feature is WIP.
   - [ ] **CLUSTER_NAME**: arbitrary name for the DB cluster.
1. Download and install [DigitalOcean doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/).
1. Create and API key in [DigitalOcean](https://cloud.digitalocean.com/account/api/tokens) and store it securely.
1. Authenticate locally using `doctl auth init`
1. From the root directory of the repo, deploy the app using `doctl apps create --spec .do\app.yaml`
1. Once the app is deployed. Configure the `NEXTAUTH_URL` with the app URL.
1. Run Prisma migrations from the DigitalOcean console `npx prisma migrate deploy`

### Best practices when working with secrets and environment variables

**Never commit secrets to version control**

- Add `.env`, `.env.*`, and any secret files to your .gitignore.
- Use example files (like env-example) to show required variables without real values.

**Encrypt secrets at rest and in transit**

- Ensure secrets are encrypted wherever they are stored and when transmitted.
- Check `Encrypt` checkbox for sensitive values in DigitalOcean environment variables configuration.

**Do secret maintenance**

- Expire or revoke unused access tokens.
- Remove whitelisted IPs when no longer needed.

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
