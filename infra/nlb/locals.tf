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
  # Map AZ => list of subnet IDs (handles duplicates)
  az_to_subnet_ids = {
    for idx, az in data.terraform_remote_state.vpc.outputs.private_subnets_azs :
    az => concat(
      lookup(az_to_subnet_ids, az, []),
      [data.terraform_remote_state.vpc.outputs.private_subnets_ids[idx]]
    )
  }

  # EC2 instance AZ (singular) from remote state output
  target_az = data.terraform_remote_state.vpc.outputs.ec2_az

  # Subnets in the EC2 AZ (list of subnet IDs)
  selected_subnets = lookup(local.az_to_subnet_ids, local.target_az, [])

  # Build subnet_mapping list for NLB module input
  subnet_mapping = [
    for subnet_id in local.selected_subnets : {
      subnet_id = subnet_id
      # optionally include allocation_id, private_ipv4_address, ipv6_address if needed
    }
  ]
}

