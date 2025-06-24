# 📂 DigitalOcean Spaces Storage Setup

This guide explains how to set up and configure DigitalOcean Spaces storage for file uploads in the SaaS Starter Kit.

## 1. Create a Spaces Bucket in DigitalOcean

1. Log in to your [DigitalOcean Control Panel](https://cloud.digitalocean.com/).
2. In the left sidebar, click on **Spaces Object Storage**.
3. Click the **Create Bucket** button.
4. Choose a datacenter region (e.g., `nyc3`).
5. Enter a unique name for your Space (e.g., `my-app-bucket`).
6. Click **Create a Spaces Bucket**.

## 2. Generate Access Keys

1. In the Spaces dashboard, click **Access Keys** tab.
2. Click **Create Access Key**.
3. Under **Select access scope**, choose 'Limited Access'. Select your previously created bucket and select "Read/Write/Delete" permissions in the dropdown.
4. Give your key a name and click **Create Access Key**.
5. Copy the **Access Key ID** and **Secret Key**. You will not be able to see the secret again!

## 3. Configure your DigitalOcean App

1. In the left sidebar, click on **App Platform**.
2. Under 'Apps' click on your app name.
3. Click on the **Settings** tab.
4. Under 'Components' at the top of the tab, select **application**.
5. Go to **Environment variables** -> 'Edit'
6. Add the environment variables listed in [Environment variables](#environment-variables).
7. Click **Save**

## 4. Configure Your Local `.env` File

Add a `.env` file if not already created, under the /application folder and add the Spaces [Environment variables](#environment-variables).

## 4. Test Your Connection

Run your application locally. File uploads and downloads should now use your DigitalOcean Spaces bucket.

### Environment variables

For DigitalOcean Apps and local environments, the environment variables for Spaces are the following:

```
STORAGE_PROVIDER=Spaces
SPACES_KEY_ID=your-access-key-id-here # DigitalOcean Spaces Access Key Id
SPACES_KEY_SECRET=your-access-key-secret-here # DigitalOcean Spaces Access Key Secret
SPACES_REGION=spaces-bucket-region # Spaces Region
SPACES_BUCKET_NAME=spaces-bucket-name # Spaces Bucket Name
```

- Replace `your-access-key-here` and `your-secret-key-here` with the values you generated.
- Set the endpoint and region to match your Space's region.
- Set the bucket name to the name you chose for your Space.

---

For more details, see the [DigitalOcean Spaces documentation](https://docs.digitalocean.com/products/spaces/).
