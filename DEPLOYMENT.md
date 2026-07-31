# ServEase Deployment

Use this setup:

- Frontend: Vercel
- Backend: Render
- Database: Supabase Postgres
- Media uploads: Cloudinary

## 1. Supabase

Create a Supabase project and copy the Postgres connection string.

Use the pooled connection string if Supabase gives one. Save it as `DATABASE_URL` for Render.

## 2. Render Backend

Create a new Blueprint from this GitHub repository. Render will read `render.yaml`.

Set these Render environment variables:

```text
DATABASE_URL=<your Supabase Postgres URL>
CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<your-vercel-app>.vercel.app
DJANGO_ALLOWED_HOSTS=.onrender.com
```

Render generates `DJANGO_SECRET_KEY` automatically from `render.yaml`.

After deploy, your API will look like:

```text
https://servease-backend.onrender.com/api
```

## 3. Vercel Frontend

Import the same GitHub repository in Vercel.

Set:

```text
Root Directory: servease_frontend
Build Command: npm run build
Install Command: npm install --legacy-peer-deps
Output Directory: .next
```

Set this Vercel environment variable:

```text
NEXT_PUBLIC_API_URL=https://<your-render-backend>.onrender.com
```

Redeploy after adding the environment variable.

## 4. Final Update

After Vercel gives the frontend URL, update these backend environment variables in Render:

```text
CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<your-vercel-app>.vercel.app
```
