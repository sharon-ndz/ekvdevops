Deploy Multi License API with Rollback Options
=============================================

This GitHub Actions workflow automates the deployment of the Multi License API to AWS using Terraform, Docker, and EC2/SSM. It supports rollback to a previously successful Docker image tag if deployment fails.

--------------------------------------------------------------------------------
Workflow File:
  Path: .github/workflows/multi-api-deployment.yml

  Name: Deploy Multi License API with Rollback Options

--------------------------------------------------------------------------------
Prerequisites:

1. Secrets configured in your GitHub repository:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY

2. AWS setup:
   - S3 Buckets:
     - my-terraform-state-bckt43 (Terraform backend)
     - idlms-website-built-artifact (stores docker-compose.yml)
   - EC2 instance with:
     - Tag: Name=Backend API IDLMS-<env>
     - SSM Agent enabled
     - IAM Role with EC2, SSM, ECR permissions

3. Terraform tfvars files per environment (e.g., dev.tfvars)

--------------------------------------------------------------------------------
Supported Environments:
  - dev (default)
  - staging
  - prod

--------------------------------------------------------------------------------
Features:

- Deploys full IaC stack: VPC, NLB, API Gateway, CloudWatch, ECR, SSM
- Builds and pushes Docker image to ECR
- Deploys via SSM using docker-compose
- Auto rollback using last successful image tag
- Manual rollback support

--------------------------------------------------------------------------------
How to Deploy:

1. Navigate to: Actions > Deploy Multi License API with Rollback Options > Run workflow

2. Provide inputs:
   - ENV (required): dev, staging, or prod
   - ROLLBACK_TAG (optional): e.g., 2025.07.25.002

   If ROLLBACK_TAG is omitted, a new build tag will be created and used.

--------------------------------------------------------------------------------
Rollback Logic:

| Condition                       | Action                                           |
|--------------------------------|--------------------------------------------------|
| All 3 containers running        | Mark tag as last successful in SSM              |
| Any container failed            | Roll back to previous SSM tag and redeploy      |

Previous tag stored in: /idlms/license-api/last-successful-build (SSM)

--------------------------------------------------------------------------------
Terraform Directory Structure:

infra/
├── cloudwatch/
├── ecr/
├── nlb/
├── rest-api/
├── ssm/
├── vpc/
└── <env>.tfvars

--------------------------------------------------------------------------------
Workflow Steps Explained:

1. Terraform Apply: Runs per component using remote S3 state and environment tfvars.
2. Docker Build: Tags image as YYYY.MM.DD.NNN and latest.
3. ECR Push: Pushes both tags to ECR.
4. SSM Deploy: Downloads docker-compose.yml, sets env, deploys using docker-compose.
5. Rollback: If < 3 containers running, reverts to previous successful tag.

--------------------------------------------------------------------------------
Environment Variables:

| Variable         | Description                                   |
|------------------|-----------------------------------------------|
| AWS_REGION       | AWS region for deployment                     |
| TF_BUCKET        | Terraform backend S3 bucket                   |
| BACKUP_BUCKET    | S3 bucket containing docker-compose.yml       |
| ECR_REPO_URL     | Repository URL from Terraform                 |
| IMAGE_URI        | Full image URI with build tag                 |
| BUILD_TAG        | Current generated build tag                   |
| TAG_TO_DEPLOY    | Tag selected for deployment or rollback       |

--------------------------------------------------------------------------------
Debugging Tips:

- Check AWS SSM > Run Command > History for command logs.
- Terraform logs will appear in GitHub Actions console.
- Look for "Deployment failed. Rolling back..." to confirm rollback logic.

--------------------------------------------------------------------------------
Best Practices:

- Validate tfvars and SSM values before running.
- Keep docker-compose.yml updated in backup bucket.
- Retain old tags in ECR for rollback capability.

--------------------------------------------------------------------------------
