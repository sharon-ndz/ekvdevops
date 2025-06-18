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
  default     = "ami-084568db4383264d4"
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

#variable "private_lb_subnets" {
#  type = object({
#    routes                   = list(any)
#    cidrs_blocks             = list(string)
#    subnets_name_prefix      = string
#    route_table_name         = string
#  })
#}

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
#variable "private_data_subnets" {
#  type = object({
#    routes                   = list(any)
#    cidrs_blocks             = list(string)
#    subnets_name_prefix      = string
#    route_table_name         = string
#    is_public                = bool
#  })
#}

##Private Services Subnets
#variable "private_services_subnets" {
#  type = object({
#    routes                   = list(any)
#    cidrs_blocks             = list(string)
#    subnets_name_prefix      = string
#    route_table_name         = string
#  })
#}

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
