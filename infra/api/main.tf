module "api-gateway" {
  source = "git::https://github.com/sharon-ndz/terraform-modules.git//api-gateway"

  environment             = var.environment
  region                  = var.region
  api_gateway_name        = var.api_gateway_name
  api_gateway_description = var.api_gateway_description
  vpc_link_name           = var.vpc_link_name
  vpc_link_arn     = data.terraform_remote_state.nlb.outputs.nlb_arn
  api_log_group_prefix    = var.api_log_group_prefix
  log_retention_days      = var.log_retention_days
  api_stage_name          = var.api_stage_name
  backend_port            = var.backend_port
  nlb_dns_name            = data.terraform_remote_state.nlb.outputs.nlb_dns_name
}
