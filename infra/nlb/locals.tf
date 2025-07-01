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

# Subnet Mapping Logic
locals {
  az_subnet_pairs = [
    for idx in range(length(data.terraform_remote_state.vpc.outputs.private_subnets_azs)) : {
      az        = data.terraform_remote_state.vpc.outputs.private_subnets_azs[idx]
      subnet_id = data.terraform_remote_state.vpc.outputs.private_subnets_ids[idx]
    }
  ]

  az_to_subnet_ids = {
    for az in distinct(data.terraform_remote_state.vpc.outputs.private_subnets_azs) :
    az => [
      for pair in local.az_subnet_pairs : pair.subnet_id if pair.az == az
    ]
  }

  target_az = data.terraform_remote_state.vpc.outputs.ec2_az
  unique_subnets = [
  for az in keys(local.az_to_subnet_ids) : local.az_to_subnet_ids[az][0]
]

subnet_mapping = [
  for subnet_id in local.unique_subnets : {
    subnet_id = subnet_id
  }
]

}
