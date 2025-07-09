# EC2 Terraform Module (Reusable) – IDLMS

This module provisions an **Amazon EC2 instance** configured for secure VPC deployment and SSM access. It is designed to be called from environment-specific configurations such as `infra/ec2`.

---

##  Path: terraform-modules/ec2

This module creates:
- An EC2 instance (without public IP)
- IAM Role and Instance Profile for SSM access
- Security Group allowing PostgreSQL access from Lambda
- IAM Policy allowing S3 read access to SQL backup

---

##  Module Files

### main.tf

Creates:
- `aws_iam_role` and `aws_iam_instance_profile` for Systems Manager access
- `aws_security_group` that allows PostgreSQL (port 5432) access from the Lambda security group
- `aws_instance` with `user_data` to install:
  - SSM Agent (via Snap)
  - AWS CLI v2
- `aws_iam_policy` for reading a SQL backup file from S3
- Attaches the policy to the SSM role

### variables.tf

Input variables:
---
variable "instance_name"               { type = string }
variable "instance_type"               { type = string }
variable "ami_id"                      { type = string }
variable "vpc_id"                      { type = string }
variable "subnet_id"                   { type = string }
variable "lambda_security_group_id"    { type = string }
variable "tags"                        { type = map(string) }
variable "sql_backup_bucket"          { type = string }
```

### outputs.tf

Exposes:
---
output "instance_id"             # EC2 Instance ID
output "private_ip"              # Private IP Address
output "ec2_security_group_id"   # Security group created
output "instance_name"           # Name of the instance
```

---

## 🔐 Security

- EC2 communicates securely over private IP with Lambda using SG rules.
- SQL port (5432) is open **only** to Lambda SG, not public internet.
- No public IP is assigned to the instance.
- IAM role has access to:
  - Systems Manager (SSM)
  - Read-only access to SQL backup in S3 bucket path:
    `s3://<sql_backup_bucket>/back-up-db/license_backup.sql`

---

## 🛠️ EC2 Configuration

User data installs:
- OS dependencies
- SSM Agent via Snap
- AWS CLI v2 via official install script
---
