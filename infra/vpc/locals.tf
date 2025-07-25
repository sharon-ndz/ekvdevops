locals {
  availability_zones     = [for subnet in var.public_subnets : subnet.az]
  public_subnet_cidrs    = [for subnet in var.public_subnets : subnet.cidr_block]
  private_subnet_cidrs   = [for subnet in var.private_subnets : subnet.cidr_block]
}
