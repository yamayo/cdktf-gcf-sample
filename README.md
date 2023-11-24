# CDKTF Google Cloud Functions Sample

## Setup

- Clone the repository
- Run npm install to install dependencies
- Create Cloud Storage bucket for Terraform remote backend

  ```bash
  gcloud storage buckets create gs://BUCKET_NAME
  ```

- Update `.env.development`
  - `PROJECT_ID` ... Your Google Cloud Project ID
  - `PROJECT_NUMBER` ... Your Google Cloud Project number
  - `TF_STATE_BUCKET` ... Cloud Storage URI created above

## Usage

#### Deploy to Google Cloud

```bash
NODE_ENV=development npx cdktf deploy
```

#### Destroy from Google Cloud

```bash
NODE_ENV=development npx cdktf destroy
```
