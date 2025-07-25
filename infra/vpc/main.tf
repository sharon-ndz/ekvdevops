module "vpc" {
  source = "../terraform-modules/vpc"

  vpc_cidr_block         = var.vpc_cidr_block
  availability_zones     = local.var.availability_zones
  public_subnet_cidrs    = local.var.public_subnet_cidrs
  private_subnet_cidrs   = local.var.private_subnet_cidrs
  project_name           = var.project_name
  tags                   = var.tags
}

