# Lambda IDLMS Terraform Module

This Terraform module provisions an AWS Lambda function with the following features:
- VPC access using security group and private subnets
- IAM execution role with permissions for Lambda and VPC networking
- Environment variable injection using SSM Parameter Store (secure, decrypted)
- CloudWatch logging enabled
- Support for publishing Lambda versions and creating a "live" alias
- Tagged resources for cost tracking or ownership

---

## Module Structure

lambda-idlms/
├── main.tf # Core resource definitions
├── variables.tf # Input variable declarations
├── outputs.tf # Exported outputs



## Features

- **IAM Role + Policy**: Grants Lambda permissions to run and access VPC and CloudWatch Logs.
- **VPC Configuration**: Attaches Lambda to private subnets and secures it with an SG.
- **Environment Variables**: Injects values securely from SSM Parameter Store.
- **Lambda Deployment**: Accepts `.zip` package, handles publishing, versioning, and aliasing.
- **Tags**: Applies consistent tags to all resources.

---

## Outputs

| Name                  | Description                                          |
|-----------------------|------------------------------------------------------|
| `function_name`       | Lambda function name                                |
| `function_invoke_arn` | ARN to invoke the Lambda                            |
| `function_version`    | Published version of the Lambda                     |
| `lambda_alias_arn`    | ARN of the `live` alias                             |

---

## Requirements

- Terraform v1.3+
- AWS CLI configured
- Lambda ZIP file must be pre-built before `terraform apply`

---

Notes
Ensure the Lambda ZIP file is built and available at the provided path.

The SSM parameter value must be a valid JSON object representing environment variables.

publish = true ensures each deployment creates a new version and updates the alias.


## Input Variables

| Name                   | Type          | Description                                          |
|------------------------|---------------|------------------------------------------------------|
| `function_name`        | `string`      | Name of the Lambda function                         |
| `handler`              | `string`      | Lambda handler (e.g., `index.handler`)              |
| `runtime`              | `string`      | Lambda runtime (e.g., `nodejs18.x`, `python3.11`)   |
| `memory_size`          | `number`      | Memory in MB (e.g., 128, 512, 1024)                 |
| `timeout`              | `number`      | Timeout in seconds                                  |
| `lambda_package`       | `string`      | Path to Lambda `.zip` package                       |
| `publish`              | `bool`        | Whether to publish new Lambda version               |
| `private_subnet_ids`   | `list(string)`| List of private subnet IDs for VPC config           |
| `vpc_id`               | `string`      | VPC ID to attach Lambda                             |
| `lambda_exec_role_name`| `string`      | Name for the IAM execution role                     |
| `lambda_sg_name`       | `string`      | Name for Lambda security group                      |
| `lambda_env_param_name`| `string`      | SSM parameter name for environment variables        |
| `tags`                 | `map(string)` | Tags to apply to all resources                      |

---
