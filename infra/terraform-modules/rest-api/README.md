Reusable Terraform Module: API Gateway REST API
===============================================

This module provisions an **AWS API Gateway REST API** that proxies requests to a **Network Load Balancer (NLB)** via a **VPC Link**. It includes CloudWatch logging, throttling, and binary media type support.

Resources Created
-----------------
- IAM Role and Policy for API Gateway CloudWatch logging
- API Gateway REST API (`aws_api_gateway_rest_api`)
- VPC Link to NLB (`aws_api_gateway_vpc_link`)
- `/` and `{proxy+}` resource integration with NLB
- CloudWatch Log Group for API Gateway logs
- Deployment and Stage with access logging
- Method-level settings (throttling, logging)

Features
--------
- Full support for ANY method on `/` and `/{proxy+}`
- VPC Link integration to an NLB 
- Optional binary media types (e.g., `*/*`)
- Centralized CloudWatch logging with configurable retention
- Stage-level throttling and method logging
- Output of deployed URL and log group name

Inputs
------

| Name                  | Type           | Description                                    |
|-----------------------|----------------|------------------------------------------------|
| `region`              | `string`       | AWS region                                     |
| `environment`         | `string`       | Environment (e.g., dev, stage, prod)           |
| `stage_name`          | `string`       | API Gateway stage name                         |
| `log_retention_days`  | `number`       | CloudWatch log retention in days               |
| `api_description`     | `string`       | Description of the API                         |
| `binary_media_types`  | `list(string)` | Binary media types to support (e.g., `*/*`)    |
| `common_tags`         | `map(string)`  | Tags applied to all resources                  |
| `vpc_link_target_arns`| `list(string)` | ARN(s) of the NLB to attach via VPC Link       |
| `nlb_dns_name`        | `string`       | DNS name of the NLB used in the integration URI|

Outputs
-------
| Name              | Description                                      |
|-------------------|--------------------------------------------------|
| `api_gateway_url` | Fully qualified URL of the deployed API stage   |
| `log_group_name`  | Name of the CloudWatch Log Group for API logs   |

