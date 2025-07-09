# Lambda Terraform Module (Reusable) – IDLMS

This is a reusable Terraform module for deploying AWS Lambda functions **inside a VPC**, complete with networking (VPC, subnets, routing), IAM roles, security groups, and Lambda configurations. It is designed to be consumed by environment-specific configurations like `infra/lambda`.

---

##  Path: terraform-modules/lambda

This folder defines the module logic that provisions:
- A Lambda function
- IAM execution roles and policies
- Private and public subnets
- NAT Gateway and Internet Gateway
- Security Group
- All necessary VPC routing components

---

##  Module Structure

### main.tf

Creates:
- **IAM Role** and policies for Lambda execution and Secrets Manager access
- **VPC**, **Subnets** (public and private), and **Internet Gateway**
- **NAT Gateway** with Elastic IP
- **Route Tables** for private and public subnets
- **Security Group** for the Lambda function (egress open)
- **AWS Lambda function** deployed from a local `.zip` package
  - Configured with handler, runtime, memory, timeout
  - Attached to private subnets and SG

### variables.tf

Accepts the following input variables:

```hcl
# Lambda config
variable "function_name"         { type = string }
variable "handler"               { type = string }
variable "runtime"               { type = string }
variable "memory_size"           { type = number }
variable "timeout"               { type = number }
variable "tags"                  { type = map(string) }

# Lambda code
variable "lambda_package" {
  description = "Path to the Lambda deployment package (zip file)"
  type        = string
}

# Networking
variable "vpc_cidr"              { type = string }
variable "subnet_azs"            { type = list(string) }
variable "subnet_cidrs"          { type = list(string) }
variable "public_subnet_cidr"    { type = string }
variable "resource_name_prefix"  { type = string }
```

---

### outputs.tf

Exposes the following outputs for downstream use:
```hcl
output "lambda_function_name"   # Name of the Lambda
output "lambda_arn"             # Full ARN
output "lambda_invoke_arn"      # Invoke ARN (for API Gateway)
output "vpc_id"                 # Created VPC ID
output "private_subnet_ids"     # List of private subnet IDs
output "lambda_sg_id"           # Security group ID
```

---

##  Key Features

- **VPC-Attached Lambda**: Provides access to private networking resources (like RDS, Redis).
- **Complete VPC Setup**: Avoids reliance on pre-existing network infra.
- **Security Policies**: Includes Secrets Manager access and logging.
- **Modular and Reusable**: Used across environments by calling from `infra/lambda`.

---

## 💡 Notes

- The Lambda function is deployed **from a `.zip` file** specified by `lambda_package`.
- Ensure you run `zip` or a build pipeline before applying.
- Uses **NAT Gateway** so the Lambda in private subnet can reach the internet.

---

## 🔒 IAM Policies Attached

- `AWSLambdaBasicExecutionRole`
- `SecretsManagerReadWrite`
- `AWSLambdaVPCAccessExecutionRole`

These allow the Lambda to log to CloudWatch, access secrets, and run in a VPC.

---

## 📝 Tags

All resources (VPC, subnets, SG, Lambda, etc.) support tagging via the `tags` input variable.
