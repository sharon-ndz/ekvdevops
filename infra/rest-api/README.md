REST API Gateway Infrastructure (Terraform)
===========================================

This Terraform configuration automates the deployment of an AWS API Gateway REST API that routes requests to an NLB (Network Load Balancer), which in turn connects to backend services (e.g., EC2 or containerized applications). The setup integrates with existing VPC and NLB infrastructure defined in separate Terraform modules.

Project Structure
-----------------

infra/
├── rest-api/
│   ├── backend.tf              # Terraform remote backend (S3)
│   ├── main.tf                 # Calls the reusable API Gateway module
│   ├── provider.tf             # AWS provider configuration
│   ├── variables.tf            # Input variable definitions
│   ├── data.tf                 # References to remote state for VPC and NLB
│   ├── locals.tf               # Locals for NLB DNS and ARN
│   ├── dev.tfvars              # Development environment values

Dependencies
------------

This module depends on:
- A VPC stack (`dev/vpc/terraform.tfstate`) providing network configuration.
- An NLB stack (`dev/nlb/terraform.tfstate`) exposing a DNS name and target ARN.

Ensure both are applied and have valid outputs before applying this module.

Module Usage
------------

The `main.tf` uses a reusable module located at:

../terraform-modules/rest-api

This module must expose resources to configure:
- REST API Gateway
- Binary media types
- VPC Link integration
- CloudWatch logging
- Stage deployments

Deployment Instructions
-----------------------

1. Initialize Terraform

    terraform init -backend-config=backend.tf

2. Validate the configuration

    terraform validate

3. Plan the changes

    terraform plan -var-file=dev.tfvars

4. Apply the changes

    terraform apply -var-file=dev.tfvars

Input Variables (from `variables.tf`)
-------------------------------------

| Name                 | Type           | Description                                 |
|----------------------|----------------|---------------------------------------------|
| `region`             | `string`       | AWS region                                  |
| `environment`        | `string`       | Environment (dev, stage, prod)              |
| `stage_name`         | `string`       | Name of the API Gateway stage               |
| `log_retention_days` | `number`       | CloudWatch log retention duration (in days) |
| `api_description`    | `string`       | Description for the REST API                |
| `binary_media_types` | `list(string)` | Media types to be handled as binary         |
| `common_tags`        | `map(string)`  | Tags to apply to all AWS resources          |

Remote State References
-----------------------

The NLB outputs are used to:
- Retrieve the NLB DNS name (`nlb_dns_name`)
- Create a VPC link using the NLB ARN (`vpc_link_target_arns`)

Clean-up
--------

To destroy the deployed resources:

    terraform destroy -var-file=dev.tfvars

Tags
-----

Resources created will be tagged with:

    common_tags = {
      Environment = "dev"
      Project     = "idlms"
      Owner       = "idlms-api"
    }
