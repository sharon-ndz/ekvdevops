# Lambda and SSM Parameter Store Infrastructure

This Terraform setup provisions the following:

- **AWS Lambda Function** with environment variables securely injected from **SSM Parameter Store**.
- **SSM SecureString Parameter** storing environment configuration as a JSON blob.
- **IAM Role**, **Security Group**, and **VPC Configurations** (assumed to be pre-provisioned via remote state).
- Supports deployment in private subnets with optional version publishing.

---

## Folder Structure

idlms/
├── infra/
│ ├── lambda-idlms/ # Uses lambda-idlms module
│ │ ├── main.tf
│ │ ├── variables.tf
│ │ └── outputs.tf



---

## Lambda Module Inputs (`infra/lambda-idlms`)

| Variable Name            | Description                                 | Type         |
|--------------------------|---------------------------------------------|--------------|
| `function_name`          | Lambda function name                        | `string`     |
| `handler`                | Lambda handler (e.g., `index.handler`)      | `string`     |
| `runtime`                | Lambda runtime (e.g., `nodejs18.x`)         | `string`     |
| `memory_size`            | Memory allocated to the Lambda              | `number`     |
| `timeout`                | Timeout for the function (in seconds)       | `number`     |
| `lambda_package`         | Path to ZIP file with Lambda code           | `string`     |
| `lambda_env_param_name`  | SSM Parameter name holding env vars         | `string`     |
| `lambda_exec_role_name`  | IAM role for Lambda execution               | `string`     |
| `lambda_sg_name`         | Security group name for Lambda              | `string`     |
| `vpc_id`                 | (From remote state) VPC ID                  | `string`     |
| `private_subnet_ids`     | (From remote state) List of private subnets | `list(string)`|
| `publish`                | Whether to publish a new version            | `bool`       |
| `tags`                   | Tags to apply to resources                  | `map(string)`|

---

## SSM Module Inputs (`infra/ssm`)

| Variable Name            | Description                                 | Type         |
|--------------------------|---------------------------------------------|--------------|
| `lambda_env_param_name`  | Name of the SSM SecureString Parameter      | `string`     |
| `env_variables`          | Map of environment variables                | `map(string)`|
| `tags`                   | Tags to apply to the SSM parameter          | `map(string)`|

The SSM parameter value is stored as a JSON-encoded `map(string)` and used by the Lambda function at runtime.

---

## Outputs

From `infra/lambda-idlms/outputs.tf`:

- `function_name`
- `function_invoke_arn`
- `function_version`
- `lambda_alias_arn`

From `infra/ssm/outputs.tf` (if defined):

- `param_name`: Name of the created SSM parameter

---

## Usage

1. Ensure backend remote state for VPC is properly configured.
2. Populate `env_variables` for SSM securely with environment config.
3. Run Terraform commands:

```bash
cd infra/ssm
terraform init && terraform apply

cd ../lambda-idlms
terraform init && terraform apply



Example SSM JSON:  
{
  "ENV": "prod",
  "DB_URL": "postgres://...",
  "API_KEY": "xxxxxxx"
}
