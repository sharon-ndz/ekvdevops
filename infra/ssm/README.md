# SSM Parameter Store Deployment (Environment-Specific)

This folder provisions an AWS SSM `SecureString` parameter for storing environment-specific variables (e.g., for Lambda or EC2 instances). It uses the reusable `terraform-modules/ssm` module to keep configuration DRY and manageable across environments.

## Structure

infra/
└── ssm/
├── main.tf
└── variables.tf

## Purpose

- Create a centralized environment configuration (`.env`) in AWS Systems Manager Parameter Store.
- Reuse a shared module to ensure consistency.
- Secure the content via `SecureString`.

Input Variables:
| Name                    | Type          | Description                                      |
| ----------------------- | ------------- | ------------------------------------------------ |
| `lambda_env_param_name` | `string`      | Name of the SSM parameter (e.g., `/project/env`) |
| `env_variables`         | `map(string)` | Environment variables to store as JSON           |
| `tags`                  | `map(string)` | Tags to associate with the SSM parameter         |



 Deployment:
cd infra/ssm

terraform init
terraform apply -var-file="stage.tfvars"

Teardown:
terraform destroy -var-file="stage.tfvars"

This setup allows secure, centralized management of .env configs across multiple environments like dev, stage, and prod.
