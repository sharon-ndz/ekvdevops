locals {
  ################################ NLB Related Local Variables ################################
  stack_name = "idlms-api"

  lb_name    = "${var.environment}-${local.stack_name}-nlb"
  lb_sg_name = "${var.environment}-${local.stack_name}-nlb-sg"

  lb_sg_ingress_roles = [
    {
      description      = "Allow API Traffic"
      from_port        = 4000
      to_port          = 4000
      protocol         = "TCP"
      cidr_blocks      = ["0.0.0.0/0"]
      ipv6_cidr_blocks = null
      security_groups  = null
      self             = null
    }
  ]
}
