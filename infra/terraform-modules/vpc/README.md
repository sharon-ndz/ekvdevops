# Terraform VPC Module

This module provisions a complete Virtual Private Cloud (VPC) environment in AWS with the following components:

- A custom VPC with a configurable CIDR block.
- Public and private subnets across multiple Availability Zones.
- An Internet Gateway for public subnet internet access.
- A NAT Gateway for private subnet outbound access.
- Routing tables for public and private subnet traffic management.

## Module Structure

```bash
terraform-modules/
└── vpc/
    ├── main.tf          # Contains resource definitions for VPC, subnets, IGW, NAT GW, routes
    ├── variables.tf     # Input variables required by the module
    ├── outputs.tf       # Outputs exposed by the module



Key Features
Automatically tags all resources with user-defined metadata.

Enables public subnet instances to access the internet via an Internet Gateway.

Enables private subnet instances to access the internet via a NAT Gateway.

Fully supports multi-AZ architecture.

Prerequisites
AWS CLI configured

Terraform CLI (v1.0 or above)

Valid AWS credentials with permission to create networking resources
