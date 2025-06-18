backend.tf

This Terraform configuration sets up a remote backend using Amazon S3. A remote backend allows Terraform to store its state file (terraform.tfstate) in a centralized and versioned location, making it ideal for team collaboration and CI/CD workflows.

data.tf

This block retrieves values from an existing Terraform state file stored remotely in Amazon S3. It allows one Terraform configuration to reference outputs from another.

dev.tfvars

This section defines the networking architecture for the environment (dev), including the VPC, subnets, internet gateway (IGW), NAT gateways (NGWs), and routing. These values are typically passed to a Terraform module that provisions networking components in AWS.

ec2.tf

This Terraform resource provisions an Amazon EC2 instance to host the Backend API for the IDLMS project. The instance is configured with networking, IAM, SSM, and security best practices.

iam.tf

This configuration creates the necessary IAM role and instance profile to allow EC2 instances to use AWS Systems Manager (SSM). This enables secure, keyless access to EC2 instances using SSM Session Manager, avoiding the need for SSH and open ports.

main.tf

This Terraform block defines a reusable VPC module sourced from a GitHub repository. The module provisions the full networking infrastructure for an AWS environment, including the VPC itself, internet and NAT gateways, public and private subnets, and routing. The source parameter points to the vpc folder within a remote GitHub repository , making the module easy to reuse across projects. The environment, common_tags, and region variables help standardize the naming and tagging of AWS resources, and define the AWS region where the resources are deployed. The VPC is configured using inputs such as instance_tenancy, enable_dns_support, enable_dns_hostnames, vpc_name, and vpc_cidr. These control how the VPC operates and how it is identified. An internet gateway (internet_gateway_name) is created to allow internet access for resources in public subnets. NAT gateways are also provisioned (nat_gateway_name) based on the number specified in total_nat_gateway_required, with Elastic IPs managed under eip_for_nat_gateway_name. Public subnets are defined through the public_subnets variable and are typically used for load balancers or internet-facing services. Private subnets are defined using the private_subnets variable and are usually used for backend applications, databases, or internal services that don’t require direct internet access. This modular approach simplifies infrastructure reuse and ensures consistency across different environments (like dev, stage, and prod).

outputs.tf

This section defines various output values that are made available after Terraform applies the configuration. These outputs are useful for referencing important resource attributes in other modules or in automation scripts (like CI/CD pipelines).

🆔 VPC & Networking Outputs

vpc_id: This returns the unique ID of the VPC created by the vpc module. It's often used when attaching other AWS resources to the VPC. default_security_group_id: Outputs the ID of the default security group associated with the VPC. This can be referenced when you need basic security group settings or want to modify default rules. public_subnets_ids: A list of the subnet IDs for all public subnets created. These are typically used for load balancers or public-facing instances. private_subnets_ids: A list of the subnet IDs for all private subnets created. These are typically used for backend services and databases.

📍 CIDR Outputs public_subnets_cidrs: Provides the list of CIDR blocks assigned to the public subnets. private_subnets_cidrs: Provides the list of CIDR blocks assigned to the private subnets. Useful for defining route tables, firewall rules, or cross-VPC access controls.

🌐 EC2 Instance Output ec2_public_ip: Outputs the public IP address of the EC2 instance named web. This is helpful for remote access, testing, or triggering application deployment over SSH or SSM.

prod.tfvars

The prod.tfvars file contains production-specific variable values for your Terraform configuration. This file is used to override default variables with environment-specific values when deploying your infrastructure to the production environment.

provider.tf

This block configures the AWS provider in Terraform, specifying the AWS region where resources will be created.

securitygroup.tf

This Terraform resource creates a security group named allow_ssh_and_app within your VPC. It controls inbound and outbound network traffic to your EC2 instances. The security group allows inbound SSH access (port 22) from anywhere (0.0.0.0/0), enabling you to remotely connect to your servers. It also allows inbound traffic on port 4000, which is the application port for your backend API, accessible globally. All outbound traffic is allowed without restriction, enabling your instance to communicate freely with the internet and other services. The security group is attached to the VPC created by your VPC module (vpc_id = module.vpc.vpc_id), ensuring proper network scoping. Finally, the group is tagged with the name "allow-ssh-and-app" for easy identification in the AWS console.

stage.tfvars

This file defines the configuration values specific to the staging environment to be used by your Terraform VPC module:

General Settings: environment: Set to "stage" to identify this as the staging environment. common_tags: Tags applied to all resources for tracking ownership (Owner), project (Terraform VPC), and environment (Stage). tf_state_bucket: The S3 bucket name used for storing Terraform state files.

VPC Settings: enable_dns_support and enable_dns_hostnames: Enabled to support DNS resolution within the VPC. vpc_name: Named "stage-idlms-vpc" to distinguish the staging VPC. vpc_cidr: The CIDR block allocated for the staging VPC (10.122.0.0/16).

Internet Gateway (IGW): internet_gateway_name: Name of the IGW to provide internet access to public subnets.

NAT Gateway (NGW): total_nat_gateway_required: Number of NAT gateways to create for outbound internet access from private subnets. eip_for_nat_gateway_name and nat_gateway_name: Naming conventions for Elastic IPs and NAT gateways.

Subnets: public_subnets: Contains CIDR blocks, route table name, subnet naming prefix, and public IP mapping enabled. These subnets are publicly accessible. private_subnets: Contains CIDR blocks, route table name, and subnet naming prefix for private subnets without direct internet exposure.

Instance Type: instance_type: Specifies the EC2 instance type as t2.micro for resources launched in this environment.

securitygroup.tf

This security group is designed to control network access to your EC2 instances within the specified VPC.

Ingress Rules: Allows inbound SSH access on port 22 from anywhere (0.0.0.0/0), enabling remote administration. Allows inbound traffic on port 4000, which is assumed to be the application port, accessible globally

Egress Rules: Allows all outbound traffic to any destination, enabling the instance to freely communicate outside.

VPC Association: The security group is associated with the VPC identified by module.vpc.vpc_id to ensure correct network scoping.

Tags: Named "allow-ssh-and-app" for easy identification in AWS.

variables.tf

This file defines all the input variables used by the Terraform configuration for provisioning the VPC, subnets, security groups, and EC2 instances.

General Variables environment: Used to specify the deployment environment (e.g., dev, stage, prod). Helps differentiate resources across environments. region: AWS region where the infrastructure will be deployed. Defaults to empty string but should be set explicitly. tf_state_bucket: The name of the S3 bucket used to store Terraform state files remotely. common_tags: A map of tags to be applied to all AWS resources, useful for cost tracking, ownership, and environment labeling.

VPC Configuration Variables instance_tenancy: Defines the tenancy option for instances launched in the VPC (default is "default"). enable_dns_support: Enables or disables DNS resolution within the VPC (boolean). enable_dns_hostnames: Enables or disables DNS hostnames for instances launched in the VPC (boolean). vpc_name: The name tag assigned to the VPC for easy identification. vpc_cidr: The CIDR block defining the IP address range of the VPC (e.g., 10.0.0.0/16).

Internet Gateway (IGW) Variables internet_gateway_name The name tag for the Internet Gateway resource attached to the VPC.

NAT Gateway (NGW) Variables total_nat_gateway_required: Number of NAT gateways to create, usually one per availability zone for high availability. eip_for_nat_gateway_name: Naming prefix for Elastic IP addresses assigned to NAT gateways. nat_gateway_name: Naming prefix for the NAT gateways themselves.

Subnet Variables private_subnets: An object defining the private subnets configuration, including: routes: A list of routing rules (empty list if none). cidrs_blocks: List of CIDR blocks allocated to private subnets. subnets_name_prefix: Prefix used for naming private subnets. route_table_name: The name of the route table associated with private subnets.

public_subnets: An object defining the public subnets configuration, including: routes: A list of routing rules. cidrs_blocks: List of CIDR blocks allocated to public subnets. subnets_name_prefix: Prefix used for naming public subnets. map_public_ip_on_launch: Boolean that determines if instances get a public IP automatically. route_table_name: The name of the route table associated with public subnets.

EC2 Instance Variables

instance_type

Defines the EC2 instance type to launch, with a default of "t2.micro".

key_name

Name of the SSH key pair to use for EC2 instances.

public_key_path

Path to the SSH public key used for key pair creation or verification.
