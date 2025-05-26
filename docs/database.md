# 🗄️ Postgres Database Guide

This guide provides detailed instructions for setting up and working with PostgreSQL databases for the SaaS Starter Kit, covering both local development with Docker and production deployments with DigitalOcean Managed Databases.

![Database Architecture](./images/do-architecture-diagram.drawio.png)

The architecture diagram above shows how the database integrates with other components in the SaaS Starter Kit.

## Prerequisites

Before you begin, ensure the following are available:

- [Docker](https://www.docker.com/) and Docker Compose installed
- Project cloned locally via Git

## Environment Setup

### Step 1: Define Environment Variables

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

---

### Step 2: Start the PostgreSQL Container

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

---

### Step 3: Configure the Application

Next.js will automatically load environment variables from `.env`. You may place this file in either the project root or inside `application/`.

---

### Step 4: Run the App

```bash
npm run dev
```

Your app will connect to the running PostgreSQL container.

---

## 🛑 Local Setup Notes

- **For development only** – never use in production
- Volumes ensure persistent storage between container restarts
- Shut down services with:
  ```bash
  docker-compose down
  ```
- Delete all volumes/data with:
  ```bash
  docker-compose down -v
  ```

---

## 🌐 Connecting to DigitalOcean Managed PostgreSQL

### Prerequisites

- Access to your DigitalOcean project
- Your **public IP address**

---

### Step-by-Step: Whitelist IP for Access

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

## 🧯 Security Best Practices

- **Do not** commit `.env` or credentials
- Expire or revoke unused access tokens
- Remove whitelisted IPs when no longer needed

---
