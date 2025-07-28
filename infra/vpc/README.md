# VPC Terraform Module

This Terraform configuration provisions a Virtual Private Cloud (VPC) with public and private subnets using a reusable module located at `../terraform-modules/vpc`.

## 📁 Directory Structure

idlms/
├── infra/
│ └── vpc/
│ ├── main.tf
│ ├── variables.tf
│ └── outputs.tf
└── terraform-modules/
└── vpc/
└── ... (VPC module implementation)


##Purpose

- Create a custom VPC.
- Provision public and private subnets across specified availability zones.
- Tag all resources consistently for better management.

Outputs:

| Name                 | Description                        |
| -------------------- | ---------------------------------- |
| `vpc_id`             | The ID of the created VPC          |
| `private_subnet_ids` | List of private subnet IDs created |

How to Deploy:
terraform init
terraform plan -var-file="stage.tfvars"
terraform apply -var-file="stage.tfvars"


Cleanup:
terraform destroy -var-file="stage.tfvars"

This setup allows secure, centralized management of vpc across multiple environments like dev, stage, and prod.
