# EC2 Instance Deployment using Terraform (IDLMS)

This configuration provisions an **EC2 instance** in a private subnet using Terraform. It retrieves VPC and subnet details from the Lambda deployment's remote state and attaches the EC2 instance to the existing infrastructure. This setup supports environment-specific deployments (e.g., dev, prod, stage) and enables restoring SQL backups from a specified S3 bucket.

---

##  Directory: infra/ec2

This directory contains Terraform configurations for deploying an EC2 instance in the IDLMS infrastructure.

---

##  Files Overview

### backend.tf
Defines the backend configuration for Terraform state storage using an S3 bucket.
- Bucket: `back-up-tester`
- Key: `dev/ec2/terraform.tfstate`
- Region: `us-east-1`

### dev.tfvars
Defines environment-specific values for the `dev` environment

### main.tf
Calls the reusable EC2 module with parameters:
- Instance configuration (`name`, `type`, `ami_id`)
- Network configuration retrieved from Lambda remote state
- Tagging and backup bucket variables

### variables.tf
Defines input variables:
- `instance_name`, `instance_type`, `ami_id`
- `sql_backup_bucket`: Name of the S3 bucket containing the SQL backup
- `tags`: Map of tags to apply

### outputs.tf
Outputs after successful apply:
- EC2 instance ID, private IP, and name
- The SQL backup S3 bucket name

### data.tf
Imports outputs from the `lambda` module's Terraform remote state, allowing re-use of:
- `vpc_id`
- `private_subnet_ids`
- `lambda_sg_id` (used as a security group for EC2)

---

##  Dependency

This EC2 deployment **depends on the Lambda module** being deployed first. It uses `terraform_remote_state` to pull shared networking outputs from the Lambda stack (`dev/lambda/terraform.tfstate`).

---

## Deployment Steps

1. Initialize Terraform
```bash
terraform init
terraform plan -var-file="dev.tfvars"
terraform apply -var-file="dev.tfvars"

Folder Structure
infra/
└── ec2/
    ├── backend.tf          # Terraform remote state config
    ├── main.tf             # EC2 module definition
    ├── variables.tf        # Input variable declarations
    ├── outputs.tf          # Output values
    ├── data.tf             # Remote state from lambda
    ├── dev.tfvars          # Dev environment variables
    ├── stage.tfvars        # (Optional) Stage env config
    ├── prod.tfvars         # (Optional) Prod env config
    └── provider.tf         # AWS provider config (assumed present)

