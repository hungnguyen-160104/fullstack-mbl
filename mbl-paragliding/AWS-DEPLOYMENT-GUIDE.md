# AWS Deployment Guide - Zero Cost (Free Tier)

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup Checklist](#setup-checklist)
3. [Step-by-Step Deployment](#step-by-step-deployment)
4. [Environment Variables & Secrets](#environment-variables--secrets)
5. [Cost Monitoring](#cost-monitoring)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

### Recommended Stack (All Free Tier Eligible)

```
┌─────────────────────┐
│  CloudFront (CDN)   │ ← Free: 1GB/month egress
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Amplify Hosting    │ ← Free: 5GB/month storage + 15GB/month bandwidth
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Lambda (APIs)      │ ← Free: 1M requests/month + 400K GB-seconds
│  + RDS Proxy        │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  RDS (MongoDB)      │ ← MongoDB Atlas Free Tier OR
│  MongoDB Atlas      │   RDS MySQL (Free: 750 hours/month)
└─────────────────────┘
```

### Alternative: All-in-One with Amplify + Lambda

This is the simplest approach for your Next.js app:

```
Amplify Hosting (Next.js)
    ↓
API Routes → Lambda@Edge or Lambda Functions
    ↓
MongoDB Atlas (Free Tier)
```

---

## ✅ Setup Checklist

- [ ] AWS Account created (with Free Tier eligibility)
- [ ] Amplify CLI installed locally
- [ ] MongoDB Atlas Free Tier cluster created
- [ ] GitHub repo connected to AWS
- [ ] Environment variables configured
- [ ] Cost monitoring alarms set up

---

## 🚀 Step-by-Step Deployment

### **Option A: Amplify (Recommended for Beginners)**

#### 1️⃣ Install AWS Amplify CLI

```bash
npm install -g @aws-amplify/cli
amplify configure
# Follow prompts to connect AWS account
```

#### 2️⃣ Initialize Amplify in Your Project

```bash
amplify init
# Project name: mbl-paragliding
# Environment: prod
# Default editor: Visual Studio Code
# Deployment bucket: Create new
```

#### 3️⃣ Add Hosting

```bash
amplify add hosting
# Hosting type: AWS Amplify Console
# Build settings: Use recommended (detects Next.js)
```

#### 4️⃣ Configure Environment Variables in Amplify

In AWS Amplify Console:

1. Go to App → Environment Variables
2. Add all secrets:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-strong-secret-key
CLOUDINARY_URL=cloudinary://...
TELEGRAM_BOT_TOKEN=...
SINGLE_USER=admin
SINGLE_PASSWORD=your-strong-password
```

#### 5️⃣ Deploy

```bash
amplify publish
# Select environment: prod
```

**Amplify Benefits:**

- ✅ Free: 5GB storage + 15GB/month bandwidth
- ✅ Automatic HTTPS
- ✅ CI/CD from GitHub (auto deploy on push)
- ✅ Automatic builds every commit
- ✅ Zero-config for Next.js

---

### **Option B: Manual AWS - App Runner (Simpler than EC2)**

#### 1️⃣ Create Container Image

Update `Dockerfile` for production:

```dockerfile
# See ./Dockerfile (already optimized)
# Should be multi-stage with minimal final image
```

#### 2️⃣ Push to ECR (Elastic Container Registry)

```bash
# Create repository
aws ecr create-repository --repository-name mbl-paragliding --region ap-southeast-1

# Build and push image
docker build -t mbl-paragliding:latest .
docker tag mbl-paragliding:latest 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/mbl-paragliding:latest
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.ap-southeast-1.amazonaws.com
docker push 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/mbl-paragliding:latest
```

#### 3️⃣ Create App Runner Service

AWS Console → App Runner:

1. Create new service
2. Source: Image repository (ECR)
3. Container port: 8080
4. Auto-deploy: Enabled
5. Environment variables: Add all secrets
6. Create & Deploy

**App Runner Benefits:**

- ✅ Free: 1 small instance (0.25 vCPU, 512MB RAM) for 750 hours/month
- ✅ Auto-scaling included
- ✅ HTTPS automatic
- ✅ Simple setup

---

### **Option C: Lambda + API Gateway (Most Serverless)**

#### 1️⃣ Convert Next.js to Serverless

```bash
npm install @vendia/serverless-express
```

#### 2️⃣ Deploy with Serverless Framework

```bash
npm install -g serverless
serverless deploy
```

**Lambda Benefits:**

- ✅ Free: 1M requests + 400K GB-seconds/month
- ✅ Auto-scaling
- ✅ Pay-per-use (probably still free)
- ⚠️ Cold start time (3-5 seconds first request)

---

## 🔐 Environment Variables & Secrets Management

### Method 1: AWS Secrets Manager (Recommended)

```bash
# Store secrets securely
aws secretsmanager create-secret \
  --name mbl-paragliding/prod \
  --secret-string '{
    "JWT_SECRET": "your-secret",
    "MONGODB_URI": "mongodb+srv://...",
    "SINGLE_PASSWORD": "your-password",
    ...
  }'
```

In Next.js, retrieve on server-side:

```typescript
// lib/secrets.ts
import { SecretsManager } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManager({ region: "ap-southeast-1" });

export async function getSecrets() {
  const secret = await client.getSecretValue({
    SecretId: "mbl-paragliding/prod",
  });
  return JSON.parse(secret.SecretString!);
}
```

### Method 2: Environment Variables in Deployment Platform

**For Amplify:**

```
App → Environment Variables → Add
```

**For App Runner:**

```
Service → Configuration → Environment Variables
```

**For Lambda:**

```
Configuration → Environment Variables
```

### Variables Checklist

```env
# 🔴 SECRETS (NEVER in .env.local!)
MONGODB_URI=mongodb+srv://...
JWT_SECRET=min-32-chars
SINGLE_PASSWORD=strong-password
CLOUDINARY_URL=cloudinary://...
TELEGRAM_BOT_TOKEN=...

# 🟡 SENSITIVE (but can be semi-public)
SINGLE_USER=admin
JWT_EXPIRES_IN=7d

# 🟢 PUBLIC (safe in .env.example)
NEXT_PUBLIC_API_BASE_URL=https://mebayluon.com
NODE_ENV=production
```

---

## 💰 Cost Monitoring

### Set Up Free Tier Alerts

```bash
# AWS CLI
aws budgets create-budget \
  --account-id YOUR_ACCOUNT_ID \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

### Free Tier Limits (per month)

| Service           | Limit                   | Risk               |
| ----------------- | ----------------------- | ------------------ |
| Amplify           | 5GB storage + 15GB BW   | Low                |
| Lambda            | 1M requests + 400K GB-s | Low                |
| MongoDB Atlas     | 512MB storage           | Medium (grow slow) |
| RDS               | 750 hours t2.micro      | Low                |
| CloudFront        | 1GB egress              | Low                |
| Data Transfer OUT | 1GB/month               | Low                |

### What Could Cost Money?

❌ **Avoiding These Costs:**

1. **MongoDB Atlas**: Upgrade from Free (512MB) to Paid
   - Solution: Keep data small, clean up regularly
2. **Data Transfer OUT** (inter-region): $0.02/GB
   - Solution: Use same region (ap-southeast-1)
3. **Database IOPS**: Excessive queries
   - Solution: Use caching, indexes, .lean()
4. **Reserved Capacity**: Don't buy reserved instances
   - Solution: Use on-demand only (still free with limits)

### Monthly Cost Breakdown (Zero-Cost Scenario)

```
✅ Amplify Hosting: FREE (5GB/15GB)
✅ Lambda: FREE (1M requests)
✅ API Gateway: FREE (1M requests)
✅ MongoDB Atlas: FREE (512MB)
✅ CloudFront: FREE (1GB)
✅ Data Transfer: FREE (1GB out)
─────────────────────────────────
💰 TOTAL: $0 (within free tier limits)

⚠️ If exceeded:
- Amplify overage: $0.15/GB
- Lambda: $0.0000002 per request
- Data out: $0.085/GB
```

---

## 🔧 Troubleshooting

### Issue: "Build failed on Amplify"

**Solution:**

```bash
# Increase build timeout
amplify update hosting
# Set timeout to 30 minutes
```

### Issue: "Lambda cold start taking 5+ seconds"

**Solution:**

- Use Amplify or App Runner instead (not Lambda)
- Or use Lambda Provisioned Concurrency (costs money)

### Issue: "MongoDB connection timeout"

**Solution:**

```javascript
// Add IP whitelist in MongoDB Atlas
// Allow: 0.0.0.0/0 (or specific AWS ranges)

// Or use MongoDB Atlas Data API (REST)
```

### Issue: "Environment variables not loading"

**Solution:**

```bash
# Check Amplify env
amplify env list
amplify env get --name prod

# Check env file locally
cat .env.local
echo $MONGODB_URI
```

---

## 📊 Production Checklist Before Deploy

- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in codebase
- [ ] Build locally: `npm run build` ✅
- [ ] Test locally: `npm start` ✅
- [ ] MongoDB connection working
- [ ] Admin login tested
- [ ] Images loading from Cloudinary
- [ ] Telegram notifications working
- [ ] Cost alarms configured
- [ ] Monitoring dashboards set up

---

## 🎯 Recommended Path

**For fastest setup (< 30 minutes):**

1. Create MongoDB Atlas Free Tier
2. Use **Amplify Hosting** (GitHub + auto-deploy)
3. Add environment variables in Amplify Console
4. Deploy with `amplify publish`

**Total Cost: $0** ✅

---

## 📚 Useful Links

- [AWS Free Tier](https://aws.amazon.com/free/)
- [Amplify Documentation](https://docs.amplify.aws/)
- [MongoDB Atlas Free Tier](https://www.mongodb.com/cloud/atlas/lp/try4)
- [App Runner Pricing](https://aws.amazon.com/apprunner/pricing/)
- [EC2 Free Tier Details](https://aws.amazon.com/ec2/pricing/on-demand/)

---

**Questions? Reach out to AWS Support (free for any tier customer).**
