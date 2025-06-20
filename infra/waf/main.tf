module "waf" {
  source               = "../../../terraform-modules/waf"
  environment          = var.environment
  waf_rate_limit       = var.waf_rate_limit
  api_gateway_stage_arn = data.terraform_remote_state.api.outputs.api_stage_arn
}
