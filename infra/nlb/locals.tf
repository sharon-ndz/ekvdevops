
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

