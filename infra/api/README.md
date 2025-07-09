# REST API Gateway Deployment using Terraform (IDLMS)

This Terraform configuration sets up an **AWS API Gateway (REST)** to expose the backend Lambda function via a public HTTP endpoint. It integrates with the Lambda function through remote state reference and enables logging to CloudWatch.

---

## 📁 Directory: infra/api

This folder contains the Terraform configuration for managing the REST API Gateway layer of the serverless architecture.

---

## 📄 Files Overview

### backend.tf
Defines the Terraform remote backend using an S3 bucket to store the `api` environment state file.

### dev.tfvars
Defines variable values for the **dev** environment:

### data.tf
Fetches output values from the **Lambda** Terraform state using `terraform_remote_state`. Required Lambda outputs:
- `lambda_function_name`
- `lambda_function_invoke_arn`

These outputs are used for integrating API Gateway with the Lambda function.

### main.tf
Calls the `api-gateway` Terraform module with:
- API and stage names
- Lambda function name and invoke ARN from remote state
- CloudWatch log group name for monitoring

### variables.tf
Defines required input variables:
- `api_name`
- `stage_name`
- `region`
- `log_group_name`

### outputs.tf
Outputs the public **API Gateway endpoint URL**:
```hcl
output "api_url" {
  value = module.api_gateway.api_url
}
Deployment Steps
terraform init
terraform plan -var-file="dev.tfvars"
terraform apply -var-file="dev.tfvars"


Folder Structure
infra/
└── api/
    ├── backend.tf          # S3 backend config for API state
    ├── main.tf             # API Gateway module definition
    ├── variables.tf        # Input variable declarations
    ├── outputs.tf          # Output API URL
    ├── data.tf             # Remote state reference to Lambda
    ├── dev.tfvars          # Dev environment config
    ├── stage.tfvars        #  Stage environment config
    ├── prod.tfvars         #  Prod environment config
    └── provider.tf         # AWS provider config 

Notes
CloudWatch logging is enabled via log_group_name.
The Lambda must already be deployed and accessible via remote state.
