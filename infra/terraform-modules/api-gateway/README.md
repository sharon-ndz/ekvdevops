
# API Gateway Terraform Module (Reusable) – IDLMS

This Terraform module provisions a REST-based API Gateway that integrates with a Lambda function. It also sets up IAM roles, CloudWatch logging, access logs, and proper permissions for Lambda invocation.

---

## Path: terraform-modules/api-gateway

This module provisions:
- REST API Gateway with `{proxy+}` resource
- Lambda integration via AWS_PROXY
- CloudWatch log group
- IAM role and policies for API Gateway logging
- API Gateway stage with access logs
- Lambda permission to allow API Gateway invocation

---

##  Module Files

### main.tf

Creates:
- `aws_api_gateway_rest_api` — Main REST API
- `aws_api_gateway_resource` — Proxy `{proxy+}` path
- `aws_api_gateway_method` — ANY method
- `aws_api_gateway_integration` — AWS_PROXY to Lambda
- `aws_lambda_permission` — Allows API Gateway to invoke Lambda
- `aws_cloudwatch_log_group` — For access logging
- IAM Role + Policy — Allows API Gateway to write logs
- `aws_api_gateway_stage` — Deployment stage with access logging enabled

Also includes a `null_resource` delay to ensure IAM propagation.

---

### variables.tf

Input variables:
```
variable "api_name"             { type = string }
variable "stage_name"           { type = string }
variable "lambda_function_name" { type = string }
variable "lambda_invoke_arn"    { type = string }
variable "region"               { type = string }
variable "log_group_name" {
  description = "Name of the CloudWatch Log Group for API Gateway access logs"
  type        = string
}
```

---

### outputs.tf

Outputs:
```
output "api_url"                     # Full URL to access the deployed API
output "api_gateway_execution_arn"  # Useful for permissions or other references
```

---

##  Security & Logging

- Access logs go to the specified CloudWatch Log Group.
- IAM roles are created to allow logging.
- API Gateway gets permission to invoke the attached Lambda function.

---

##  Access Logs Format

The logs include:
- Request ID
- API ID
- Domain and Stage
- HTTP method and path
- Status, latency, response size
- Client IP and User Agent

---
