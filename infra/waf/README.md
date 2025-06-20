
AWS WAF Setup for API Gateway
=============================

This Terraform configuration sets up an AWS WAFv2 Web ACL for protecting the API Gateway REST API against high request rates from individual IPs.

📁 Directory Structure

    idms/
    └── infra/
        └── waf/
            ├── main.tf
            ├── variables.tf
            ├── outputs.tf
            ├── data.tf
            └── stage.tfvars

📦 Module Used

This setup uses a reusable Terraform module:

    source = "../../../terraform-modules/waf"

🔐 WAF Features

- Rate limiting: Blocks requests from IPs exceeding a configurable threshold (default: 1000 req/5 min).
- Regional Scope: Protects REGIONAL API Gateway.
- CloudWatch Metrics: Enabled for visibility and sampled request tracking.

📄 Files Overview

| File           | Purpose |
|----------------|---------|
| main.tf        | Declares the WAF module and passes required variables |
| variables.tf   | Defines input variables |
| outputs.tf     | Outputs WAF ARN |
| data.tf        | Fetches API Gateway stage ARN from remote state |
| stage.tfvars   | Environment-specific values (e.g., stage) |

🔧 Required Remote State

This configuration pulls the api_gateway_stage_arn from the API environment’s Terraform state:

    data "terraform_remote_state" "api" {
      backend = "s3"
      config = {
        bucket = var.api_tf_state_bucket
        key    = var.api_tf_state_key
        region = var.api_tf_state_region
      }
    }


🚀 Usage

1. Navigate to the WAF directory:

       cd idms/infra/waf

2. Run plan:

       terraform init
       terraform plan -var-file=stage.tfvars

3. Apply:

       terraform apply -var-file=stage.tfvars

🔄 Outputs

- waf_arn: ARN of the created WAF Web ACL.

🧼 Clean Up

To destroy the WAF setup:

    terraform destroy -var-file=stage.tfvars

📝 Notes

- Ensure the API stack is deployed first so that the WAF setup can read its stage_arn.
- If you get unsupported attribute errors, double-check that the output api_gateway_stage_arn exists in the API stack and terraform apply was run there.

🧠 Related Modules

- terraform-modules/waf: Contains reusable logic for WAF resource and association.
