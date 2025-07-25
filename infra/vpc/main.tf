module "vpc" {
  source = "../terraform-modules/vpc"

  vpc_cidr_block       = var.cidr_block
  availability_zones   = [for subnet in var.public_subnets : subnet.az]
  public_subnet_cidrs  = [for subnet in var.public_subnets : subnet.cidr_block]
  private_subnet_cidrs = [for subnet in var.private_subnets : subnet.cidr_block]
  project_name         = var.vpc_name
  tags                 = var.tags
}

