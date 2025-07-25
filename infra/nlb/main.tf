
module "group_1_nlb" {
  source               = "../terraform-modules/nlb"

  name                 = "${var.environment}-idlms-nlb"
  internal             = var.internal
  load_balancer_type   = var.load_balancer_type
  vpc_id               = data.terraform_remote_state.vpc.outputs.vpc_id
  target_ips           = [data.terraform_remote_state.vpc.outputs.ec2_private_ip]
  target_port          = var.target_port
  environment          = var.environment

  subnet_mapping = local.subnet_mapping  # From NLB module locals (or you can pass the selected_subnets and build subnet_mapping in root)  

  create_sg     = var.lb_create_sg
  sg_name       = "${var.environment}-group-1-nlb-sg"
  ingress_roles = local.lb_sg_ingress_roles
  egress_roles  = var.lb_egress_roles
  additional_ports   = var.additional_ports
  tags          = var.common_tags
}


