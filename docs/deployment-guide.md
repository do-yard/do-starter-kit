# 🚀 Deployment Guide

This guide expands on the deployment information in the README, providing detailed instructions for deploying and managing the DigitalOcean SaaS Starter Kit in production.

## Prerequisites

Before proceeding with deployment, ensure you have:

- A [DigitalOcean account](https://cloud.digitalocean.com/registrations/new)
- Your application code pushed to a GitHub repository
- A DigitalOcean Spaces bucket created for file storage (see [Storage.md](./storage.md))
- (Optional) A custom domain you want to use for your application

## Deployment Options

You have two main options for deploying to DigitalOcean:

1. **Basic deployment** - Quick and automated, using the Deploy to DigitalOcean button (covered in the README)
2. **Advanced deployment** - More customizable, with additional configuration options (covered here)

## Advanced Configuration Options

This section covers advanced deployment configurations that go beyond the basic setup described in the README.

### Environment Optimization

When configuring your App Platform deployment, consider these optimization options:

1. **Resource Allocation**:
   - For production workloads, select at least the Basic plan with 1GB RAM / 1 CPU
   - For high-traffic applications, consider the Professional plan with multiple instances

2. **Build-time Optimization**:
   - Consider enabling build caching to speed up deployments
   - Set NODE_ENV=production for optimized builds

### Advanced App Configuration

1. **Select repository and branch**:
   - The repository should be pre-selected if you used the Deploy button
   - Choose the branch you want to deploy (usually `main`)

2. **Set up resource type**:
   - Choose the region closest to your target users
   - Select your preferred resources (Basic, Professional, or Premier plan)
   - Recommended starting point: Basic plan with 1GB RAM / 1 CPU

3. **Configure app name and environment variables**:
   - Give your app a descriptive name
   - Set up required environment variables (detailed in Step 4)

### Step 4: Set Environment Variables

The following environment variables are required:

1. **Database Environment Variables**:
   ```
   DATABASE_URL=postgres://username:password@host:port/database
   ```
   - This will be automatically configured if you create a DigitalOcean Managed Database

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
   - Get these values from your DigitalOcean Spaces setup (see [Storage.md](./storage.md))

4. **Application-specific Environment Variables**:
   ```
   APP_URL=https://your-app-name.ondigitalocean.app
   APP_ENV=production
   ```

### Step 5: Add a Database

You have two options for your database:

### Database Configuration Options

#### Managed Database (Recommended)

For production deployments, a DigitalOcean Managed Database offers several advantages:
- Automated backups and maintenance
- High availability configurations
- Simplified scaling
- Metrics and monitoring

**Advanced Configuration:**
- Enable automated daily backups
- Configure connection pools for optimal performance
- Set up read-only nodes for read-heavy applications
- Configure private networking for enhanced security

#### External Database Connection

When using an external database:
- Ensure your firewall allows connections from App Platform's IP ranges
- Consider using SSL connections for enhanced security
- Use connection pooling for performance optimization
- Implement proper database credentials rotation

### Advanced Build and Deployment Options

#### CI/CD Pipeline Integration

For more complex applications:
1. Use GitHub Actions for pre-deployment testing
2. Set up a staging environment with preview deployments
3. Configure branch-specific deployments

#### Custom Domain and SSL

For production applications:
1. Register your domain in the App Platform settings
2. Configure your DNS settings as instructed
3. Let DigitalOcean manage your SSL certificates or upload custom ones

#### Performance Optimization

For high-traffic applications:
1. Enable auto-scaling in App Platform
2. Configure proper cache headers for static assets
3. Implement API rate limiting

## Post-Deployment Steps

### Step 1: Run Database Migrations

After your app is deployed, you need to run database migrations:

1. In your App Platform dashboard, select your app
2. Go to the **Console** tab
3. Click **Launch Console** to open a terminal
4. Run the following commands:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### Step 2: Verify Your Application

1. Access your application using the URL provided in the App Platform dashboard
2. Test key functionality to ensure everything works as expected
3. Check the logs for any errors

### Step 3: Set Up Domain (Optional)

To use a custom domain:

1. In your App Platform dashboard, select your app
2. Go to the **Settings** tab
3. Under **Domains**, click **Add Domain**
4. Follow the instructions to configure your domain's DNS settings

## Scaling Your Application

As your SaaS grows, you can scale your resources:

1. **Vertical Scaling** - Increase the resources (RAM/CPU) of your existing components
   - Go to your App Platform dashboard
   - Select your app
   - Go to **Settings** > **Edit Plan**
   - Select a higher tier plan

2. **Horizontal Scaling** - Add more instances of your application
   - Go to your App Platform dashboard
   - Select your app
   - Go to **Settings** > **Edit Plan**
   - Increase the number of app instances

3. **Database Scaling** - Upgrade your database plan
   - Go to your Databases dashboard
   - Select your database
   - Click **Resize Cluster**
   - Choose a higher tier plan

## Monitoring and Logging

App Platform provides built-in monitoring and logging:

1. **Application Metrics**:
   - Access from your App Platform dashboard
   - Monitor CPU usage, memory, and requests

2. **Logs**:
   - Access from the **Logs** tab in your App Platform dashboard
   - Filter logs by component or search for specific terms

3. **Alerts**:
   - Set up alerts for when your app exceeds resource thresholds
   - Configure under **Settings** > **Alerts**

## Security Best Practices

1. **Environment Variables**:
   - Never commit sensitive environment variables to your repository
   - Regularly rotate secrets and API keys

2. **Authentication**:
   - Regularly update your NextAuth secret
   - Consider adding additional authentication providers for enhanced security

3. **Database Security**:
   - Enable automated backups for your database
   - Use the most restrictive database user permissions necessary

4. **Spaces Security**:
   - Use limited-access API keys for Spaces
   - Set appropriate CORS policies

## Continuous Deployment

To set up continuous deployment:

1. In your App Platform dashboard, go to your app settings
2. Enable **Auto Deploy** for automatic deployments when you push to your GitHub branch
3. Configure **Preview Deployments** for pull requests to test changes before merging

## Deployment Architecture

![Deployment Architecture](./images/do-architecture-diagram.drawio.png)

This SaaS Starter Kit uses a modern cloud architecture:

- **Frontend**: Statically generated and served via CDN
- **Backend**: Serverless API endpoints
- **Database**: Managed PostgreSQL database
- **Storage**: Object storage via DigitalOcean Spaces
- **Authentication**: NextAuth.js integrated with database

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**:
   - Check your build logs for specific errors
   - Verify your dependencies are correctly specified in `package.json`
   - Common error: Missing dependencies or incorrect Node.js version

2. **Database Connection Issues**:
   - Ensure your `DATABASE_URL` is correctly formatted
   - Check that your database is accessible from your app region
   - Common error: "Connection refused" - verify network rules and credentials

3. **Storage Issues**:
   - Verify your Spaces credentials are correct
   - Check that your bucket has the right permissions set
   - Common error: "Access Denied" - verify IAM policy and bucket permissions

4. **Application Crashes**:
   - Check app logs for runtime errors
   - Verify all required environment variables are set
   - Common error: "TypeError: Cannot read property of undefined" - check environment variables

### Database-Specific Issues

1. **Migration Failures**:
   ```
   Error: P3014: Prisma Migrate could not create the shadow database
   ```
   - This typically indicates permission issues with the database user
   - Ensure your database user has the necessary privileges
   - Try running migrations manually through the console

2. **Connection Pool Exhaustion**:
   - If your app becomes unresponsive, check for database connection limits
   - Configure connection pooling in your Prisma client
   - Consider increasing database plan if you're hitting limits

### Spaces Storage Issues

1. **Upload Failures**:
   - Check CORS configuration in your Spaces settings
   - Verify file size limits (default 500MB)
   - Ensure proper Content-Type is being set on uploads

2. **Download/Access Issues**:
   - Verify that files have appropriate public/private permissions
   - Check signed URL expiration times if using signed URLs
   - Ensure your bucket policy allows appropriate access

### Debugging Tips

1. **App Platform Logs**:
   - Filter logs by component for targeted troubleshooting
   - Use log severity filters to focus on errors
   - Check both build logs and runtime logs

2. **Local vs Production Discrepancies**:
   - Run the app in production mode locally to replicate issues
   - Match environment variables between environments
   - Test with equivalent Node.js version

For additional support, refer to the [DigitalOcean App Platform documentation](https://docs.digitalocean.com/products/app-platform/) or reach out to DigitalOcean support.
