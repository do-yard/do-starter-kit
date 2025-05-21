# DigitalOcean Spaces Storage Setup

## 1. Create a Spaces Bucket in DigitalOcean

1. Log in to your [DigitalOcean Control Panel](https://cloud.digitalocean.com/).
2. In the left sidebar, click on **Spaces Object Storage**.
3. Click the **Create Bucket** button.
4. Choose a datacenter region (e.g., `nyc3`).
6. Enter a unique name for your Space (e.g., `my-app-bucket`).
7. Click **Create a Spaces Bucket**.

## 2. Generate Access Keys

1. In the Spaces dashboard, click **Access Keys** tab.
2. Click **Create Access Key**.
3. Under **Select access scope**, choose 'Limited Access'. Select your previously created bucket and select "Read/Write/Delete" permissions in the dropdow. 
3. Give your key a name and click **Create Access Key**.
4. Copy the **Access Key ID** and **Secret Key**. You will not be able to see the secret again!

## 3. Configure Your Local `.env` File

Add the following variables to your `.env` file in the root of your project:

```
DO_SPACES_KEY=your-access-key-id-here
DO_SPACES_SECRET=your-secret-key-here
DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com
DO_SPACES_REGION=nyc3
DO_SPACES_BUCKET=my-app-bucket
```

- Replace `your-access-key-here` and `your-secret-key-here` with the values you generated.
- Set the endpoint and region to match your Space's region.
- Set the bucket name to the name you chose for your Space.

## 4. Test Your Connection

Run your application locally. File uploads and downloads should now use your DigitalOcean Spaces bucket.

---

For more details, see the [DigitalOcean Spaces documentation](https://docs.digitalocean.com/products/spaces/).