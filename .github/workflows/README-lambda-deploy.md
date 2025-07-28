Deploy Lambda Workflow
======================

This GitHub Actions workflow automates the deployment of a Lambda-based NestJS application using Terraform and AWS. It also supports rollback to a specific Lambda version.

--------------------------------------------------------------------------------
Workflow File:
  Name: Deploy Lambda

--------------------------------------------------------------------------------
Inputs:

- ENV (required): Environment to deploy to. Options: dev, staging, prod.
- ROLLBACK_VERSION (optional): Version number to roll back to. If provided, deployment is skipped.

--------------------------------------------------------------------------------
Environment Variables:

| Variable        | Description                         |
|----------------|-------------------------------------|
| AWS_REGION      | AWS region                         |
| ENV             | Deployment environment             |
| FUNCTION_NAME   | Lambda function name (derived from ENV) |

--------------------------------------------------------------------------------
Deployment Flow:

1. **Trigger the Workflow Manually**
   - Go to Actions > Deploy Lambda > Run workflow.
   - Provide required input `ENV` and optional `ROLLBACK_VERSION`.

2. **Rollback Short-circuit**
   - If `ROLLBACK_VERSION` is provided, all deployment steps are skipped.

3. **Setup**
   - Checkout `feature/btl-52` branch.
   - Setup Node.js 18 (only if not rolling back).

4. **Detect Changes**
   - Compares last commit to detect if only `src/` folder was modified.

5. **Build and Package**
   - Installs production dependencies and builds the NestJS app.
   - Packages the output into `backend-api.zip` for Lambda deployment.

6. **Terraform Apply**
   - Runs `terraform apply` for:
     - VPC (only if more than `src/` changed)
     - SSM
     - Lambda (always)
     - REST API Gateway (only if more than `src/` changed)

7. **Post-deployment**
   - Captures deployed Lambda version via Terraform output.
   - Stores the deployed version to SSM:
     - `/idlms/lambda/<env>/last-successful-version`

8. **Rollback Execution (if ROLLBACK_VERSION is set)**
   - Updates Lambda alias `live` to point to the specified version.

--------------------------------------------------------------------------------
Rollback Example:

To roll back to version 15 in `staging`:

- ENV: `staging`
- ROLLBACK_VERSION: `15`

--------------------------------------------------------------------------------
Terraform Directory Structure:

infra/
├── api/
├── lambda-idlms/
├── ssm/
├── vpc/
└── <env>.tfvars

--------------------------------------------------------------------------------
Best Practices:

- Confirm valid version exists before triggering rollback.
- Store stable function versions in SSM for reference.

--------------------------------------------------------------------------------
