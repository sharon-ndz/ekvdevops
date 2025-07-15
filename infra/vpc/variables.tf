 ###General###
variable "environment" {}
variable "region" {
  description = "AWS region"
  type        = string
}

variable "tf_state_bucket" {
  type = string
  description = "name of the tf state bucket"
}

variable "common_tags" {
  type = map
}

variable "ami_id" {
  description = "AMI ID for EC2 instance"
  type        = string
}

###VPC###
variable "instance_tenancy" {
  type = string
  default = "default"
}
variable "enable_dns_support" {
  type = bool
}
variable "enable_dns_hostnames" {
  type = bool
}
variable "vpc_name" {
  type = string
}
variable "vpc_cidr" {
  type = string
}

###IGW###
variable "internet_gateway_name" {
  type = string
}

###NGW###
variable "total_nat_gateway_required" {
  type = number
}
variable "eip_for_nat_gateway_name" {
  type = string
}
variable "nat_gateway_name" {
  type = string
}

variable "private_lb_subnets" {
  type = object({
    routes                   = list(any)
    cidrs_blocks             = list(string)
    subnets_name_prefix      = string
    route_table_name         = string
  })
}

###Private Subnets###
variable "private_subnets" {
  type = object({
    routes                   = list(any)
    cidrs_blocks             = list(string)
    subnets_name_prefix      = string
    route_table_name         = string
  })
}

##Private Data Subnets
variable "private_data_subnets" {
  type = object({
    routes                   = list(any)
    cidrs_blocks             = list(string)
    subnets_name_prefix      = string
    route_table_name         = string
    is_public                = bool
  })
}

##Private Services Subnets
variable "private_services_subnets" {
  type = object({
    routes                   = list(any)
    cidrs_blocks             = list(string)
    subnets_name_prefix      = string
    route_table_name         = string
  })
}

###Public Subnets###
variable "public_subnets" {
  type = object({
    routes                   = list(any)
    cidrs_blocks             = list(string)
    subnets_name_prefix      = string
    map_public_ip_on_launch  = bool
    route_table_name         = string
  })
}

## Private App Subnets
variable "private_app_subnets" {
  type = object({
    routes              = list(any)
    cidrs_blocks        = list(string)
    subnets_name_prefix = string
    route_table_name    = string
  })
  description = "Configuration for private application subnets"
}


variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t2.micro"
}

variable "key_name" {
  default = "github-ci-key"
}
variable "public_key_path" {
  default = "~/.ssh/github-ci-key.pub"
}

variable "ec2_key_name" {
  type        = string
  description = "Key name for backend EC2"
  default     = "githubaction"
}

variable "cloudwatch_ssm_config_path" {
  type        = string
  description = "SSM parameter path for CloudWatch agent config"
  default     = "/cloudwatch/docker-config"
}

variable "ec2_tags" {
  type        = map(string)
  description = "Tags to apply to the EC2 instance"
  default = {
    Name = "Backend API IDLMS"
  }
}

###iam.tf


variable "ec2_ssm_role_name" {
  type        = string
  description = "Name for the EC2 IAM role for SSM"
  default     = "ec2_ssm_role"
}

variable "ec2_ssm_profile_name" {
  type        = string
  description = "IAM instance profile name"
  default     = "ec2_ssm_profile"
}

variable "ssm_policy_arn" {
  type        = string
  description = "ARN of the SSM managed instance core policy"
  default     = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

variable "cloudwatch_agent_policy_arn" {
  type        = string
  description = "ARN of the CloudWatch Agent policy"
  default     = "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

variable "docker_artifact_bucket" {
  description = "S3 bucket name used to store Docker backup images"
  type        = string
}

variable "app_ports" {
  description = "List of application ports to allow"
  type        = list(number)

}

