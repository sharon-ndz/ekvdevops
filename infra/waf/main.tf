module "waf" {
  source               = "git::https://github.com/sharon-ndz/terraform-modules.git//waf"
  environment          = var.environment
  waf_rate_limit       = var.waf_rate_limit
  api_gateway_stage_arn = data.terraform_remote_state.api.outputs.api_stage_arn
}
