# Terraform: ECR Repository for License API

This configuration provisions an AWS Elastic Container Registry (ECR) for the `license-api` application using a shared Terraform module.

## Folder Structure

- **Module Source:** `../terraform-modules/ecr`
- **Purpose:** Creates an environment-specific ECR repository with optional scanning and encryption.
- **Resource Name Pattern:** `license-api-<environment>`

## Usage

To deploy this ECR repository:

```bash
cd idms/infra/ecr
terraform init
terraform plan -var-file="stage.tfvars"
terraform apply -var-file="stage.tfvars"
Replace stage.tfvars with the appropriate environment (e.g., dev.tfvars, prod.tfvars).

Notes
The ECR repository will be named like license-api-stage, license-api-prod, etc.

Scanning and encryption are configurable per environment.
