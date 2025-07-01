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
  # Map AZ => Subnet ID (latest value for duplicate AZs will be used)
  az_to_subnet_id = {
    for idx, az in data.terraform_remote_state.vpc.outputs.private_subnets_azs :
    az => data.terraform_remote_state.vpc.outputs.private_subnets_ids[idx]
  }

  # Dynamically get AZs of EC2 instances (must be available in remote state)
  target_azs = toset(data.terraform_remote_state.vpc.outputs.ec2_azs)

  # Select subnet per AZ matching EC2 AZs
  selected_subnets = [
    for az in local.target_azs :
    { az = az, subnet_id = local.az_to_subnet_id[az] }
    if contains(keys(local.az_to_subnet_id), az)
  ]
}

