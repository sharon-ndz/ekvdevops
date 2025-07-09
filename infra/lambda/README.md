# AWS Lambda Terraform Deployment (IDLMS)

This Terraform configuration sets up a serverless backend application using AWS Lambda deployed into a VPC, with all necessary networking and configuration inputs. The setup is designed to be modular and reusable across environments like dev, stage, and prod.

## Directory: infra/lambda

This folder contains the environment-specific Terraform configuration for deploying a Lambda function using a reusable module from ../terraform-modules/lambda.

## Files Overview

main.tf
- Defines the Terraform module block to deploy the Lambda function. 
- Passes all necessary variables like function name, runtime, VPC networking configuration, and resource tags to the reusable module.

variables.tf
- Declares all input variables required for this Lambda deployment:
  - function_name, handler, runtime, timeout, memory_size
  - lambda_package (ZIP file path)
  - VPC inputs: vpc_cidr, subnet_cidrs, subnet_azs, public_subnet_cidr
  - resource_name_prefix
  - tags

outputs.tf
- Exports important outputs from the Lambda module:
  - lambda_function_name, lambda_function_arn, lambda_function_invoke_arn
  - vpc_id, private_subnet_ids, lambda_sg_id

dev.tfvars/stage.tfvars/prod.tfvars
- Defines the input variable values for the dev environment:
  - Lambda metadata (name, handler, memory, etc.)
  - VPC configuration (CIDR blocks, subnets, AZs)
  - Tagging and resource name prefix

## Deployment Instructions

1. Initialize Terraform
   terraform init

2. Plan the Deployment
   terraform plan -var-file="dev.tfvars"

3. Apply the Deployment
   terraform apply -var-file="dev.tfvars"

## Module: ../terraform-modules/lambda

This module handles:
- Creating the Lambda function
- Configuring VPC/subnet/Security Group settings
- Managing IAM roles and permissions

Ensure this module is available and updated before applying.

## Example Output

After applying, Terraform will return values like:
- Lambda function name and ARN
- VPC and subnet IDs
- Security group ID for the Lambda

These outputs can be used to:
- Connect API Gateway to this Lambda
- Allow other AWS services to invoke it
- Troubleshoot or monitor using AWS Console/CLI

## Notes

- Ensure backend-api.zip is built and present at the root of this directory before deployment.
- The handler should match the exported method in your Lambda codebase (dist/lambda.handler).
- Customize dev.tfvars,stage.tfvars,prod.tfvars per environment.

## Tags

All AWS resources will be tagged with:
tags = {
  Environment = "dev"
  Project     = "backend-api"
}

You can modify or extend these tags as needed.

## Example Command

terraform apply -var-file="dev.tfvars"




