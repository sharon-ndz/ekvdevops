module "http_api" {
  source             = "../terraform-modules/http-api"
  environment        = var.environment
  nlb_listener_arn   = data.terraform_remote_state.nlb.outputs.nlb_listener_arn
  nlb_dns_name       = data.terraform_remote_state.nlb.outputs.nlb_dns_name
  log_retention_days = var.log_retention_days
  private_subnet_ids = data.terraform_remote_state.vpc.outputs.private_subnets_ids
  vpc_link_subnet_ids  = data.terraform_remote_state.vpc.outputs.vpc_link_subnet_ids
  security_group_ids = [data.terraform_remote_state.vpc.outputs.default_security_group_id]
  tags               = var.common_tags
}

