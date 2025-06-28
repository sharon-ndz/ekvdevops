module "vpc" {
   source = "../terraform-modules/vpc"

    ###General###
  environment                = var.environment
  common_tags                = var.common_tags
  region                     = var.region

  ###VPC###
  instance_tenancy           = var.instance_tenancy
  enable_dns_support         = var.enable_dns_support
  enable_dns_hostnames       = var.enable_dns_hostnames
  vpc_name                   = var.vpc_name
  vpc_cidr                   = var.vpc_cidr

  ###IGW###
  internet_gateway_name      = var.internet_gateway_name

  ###NGW###
  total_nat_gateway_required = var.total_nat_gateway_required
  eip_for_nat_gateway_name   = var.eip_for_nat_gateway_name
  nat_gateway_name           = var.nat_gateway_name

  ###Public Subnets###
  public_subnets             = var.public_subnets


  ###Private  Subnets###
  private_subnets        = var.private_subnets



  
}
