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

locals {
  # Pair each availability zone with its corresponding private subnet ID
  az_subnet_pairs = [
    for idx in range(length(data.terraform_remote_state.vpc.outputs.private_subnets_azs)) : {
      az        = data.terraform_remote_state.vpc.outputs.private_subnets_azs[idx]
      subnet_id = data.terraform_remote_state.vpc.outputs.private_subnets_ids[idx]
    }
  ]

  # Deduplicate subnets per AZ (only one per AZ)
  unique_subnets_by_az = {
    for pair in local.az_subnet_pairs :
    pair.az => pair.subnet_id...
  }

  # Format into list of { subnet_id = ... } for NLB input
  unique_subnets_per_az = [
    for az, subnet_ids in local.unique_subnets_by_az :
    {
      subnet_id = subnet_ids[0]
    }
  ]
}
