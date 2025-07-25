variable "vpc_cidr_block" {}
variable "project_name" {}
variable "availability_zones" { type = list(string) }
variable "public_subnet_cidrs" { type = list(string) }
variable "private_subnet_cidrs" { type = list(string) }
variable "eip_allocation_id" {}
variable "tags" { type = map(string) }

