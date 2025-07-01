################################ NLB Related Local Variables ################################

locals {
  stack_name = var.stack_name

  lb_name    = "${var.environment}-${local.stack_name}-nlb"
  lb_sg_name = "${var.environment}-${local.stack_name}-nlb-sg"

  lb_sg_ingress_roles = [
    {
      description      = "Allow API Traffic"
      from_port        = var.lb_ingress_port
      to_port          = var.lb_ingress_port
      protocol         = "TCP"
      cidr_blocks      = var.lb_ingress_cidr_blocks
      ipv6_cidr_blocks = null
      security_groups  = null
      self             = null
    }
  ]
}

# Pair AZs with their corresponding subnet IDs
locals {
  az_subnet_pairs = [
    for idx in range(length(data.terraform_remote_state.vpc.outputs.private_subnets_ids)) : {
      az        = data.terraform_remote_state.vpc.outputs.private_subnets_azs[idx]
      subnet_id = data.terraform_remote_state.vpc.outputs.private_subnets_ids[idx]
    }
  ]

  # One unique subnet per AZ
  unique_subnet_ids = distinct([
    for az in distinct([for p in local.az_subnet_pairs : p.az]) : (
      lookup({ for p in local.az_subnet_pairs : p.az => p.subnet_id }, az, null)
    )
  ])

  # Build subnet_mapping for NLB
  subnet_mapping = [
    for subnet_id in local.unique_subnet_ids : {
      subnet_id = subnet_id
    }
  ]
}
