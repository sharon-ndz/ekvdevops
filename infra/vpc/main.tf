module "vpc" {
  source = "../terraform-modules/vpc"

  vpc_cidr_block         = var.vpc_cidr_block
  availability_zones     = var.availability_zones
  public_subnet_cidrs    = var.public_subnet_cidrs
  private_subnet_cidrs   = var.private_subnet_cidrs
  project_name           = var.project_name
  tags                   = var.tags
}

