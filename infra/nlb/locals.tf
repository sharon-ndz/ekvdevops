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
  # Create AZ -> subnet_id pairs
  az_subnet_pairs = [
    for idx in range(length(data.terraform_remote_state.vpc.outputs.private_subnets_azs)) : {
      az        = data.terraform_remote_state.vpc.outputs.private_subnets_azs[idx]
      subnet_id = data.terraform_remote_state.vpc.outputs.private_subnets_ids[idx]
    }
  ]

  # Group subnets by AZ
  az_to_subnet_ids = {
    for az in distinct(data.terraform_remote_state.vpc.outputs.private_subnets_azs) :
    az => [
      for pair in local.az_subnet_pairs : pair.subnet_id if pair.az == az
    ]
  }

  # Get EC2 AZ from remote outputs
  target_az = data.terraform_remote_state.vpc.outputs.ec2_az

  # Subnets in that AZ
  selected_subnets = lookup(local.az_to_subnet_ids, local.target_az, [])

  # ⚠️ Fail early if no subnet found
  check_subnet_selected = length(local.selected_subnets) > 0 ? true : error("❌ No private subnet found for EC2 AZ: ${local.target_az}")

  # Final subnet_mapping
  subnet_mapping = [
    for subnet_id in local.selected_subnets : {
      subnet_id = subnet_id
    }
  ]
}

