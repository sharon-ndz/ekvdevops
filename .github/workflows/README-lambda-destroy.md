Destroy Terraform Lambda Infrastructure
=======================================

This GitHub Actions workflow is used to destroy all AWS infrastructure related to the Lambda-based backend API. It removes REST API Gateway, Lambda function, SSM parameters, and VPC components using Terraform.

--------------------------------------------------------------------------------
Workflow File:
  Name: Destroy Terraform Lambda Infrastructure

--------------------------------------------------------------------------------
Inputs:

- ENV (required): Environment to destroy (dev, staging, prod)

--------------------------------------------------------------------------------
Environment Variables:

| Variable      | Description             |
|---------------|-------------------------|
| AWS_REGION    | AWS region (us-east-1)  |
| ENV           | Target environment      |

--------------------------------------------------------------------------------
Execution Flow:

1. **Trigger Manually**
   - Navigate to: Actions > Destroy Terraform Lambda Infrastructure > Run workflow
   - Input: `ENV` (e.g., dev, staging, prod)

2. **Steps Executed**

   a. **Checkout Code**
      - Checks out `feature/btl-52` branch.

   b. **Terraform Setup**
      - Uses Terraform v1.6.6.
      - Configures AWS credentials from GitHub secrets.

   c. **Destroy REST API Infra**
      - Runs `terraform destroy` in `infra/api`.

   d. **Create Dummy Lambda Package**
      - Creates a `backend-api.zip` placeholder to ensure Terraform doesn't error on missing artifacts.

   e. **Destroy Lambda Infra**
      - Runs `terraform destroy` in `infra/lambda-idlms`.

   f. **Destroy SSM Parameters**
      - Runs `terraform destroy` in `infra/ssm`.

   g. **Destroy VPC**
      - Runs `terraform destroy` in `infra/vpc`.

--------------------------------------------------------------------------------
Terraform Directory Structure:

infra/
├── api/
├── lambda-idlms/
├── ssm/
├── vpc/
└── <env>.tfvars

--------------------------------------------------------------------------------
Notes:

- Order of destruction ensures dependencies are removed cleanly.
- Dummy ZIP is needed if Terraform expects an artifact to be present.
- Make sure all changes are committed and pushed to `feature/btl-52` before running.

--------------------------------------------------------------------------------
