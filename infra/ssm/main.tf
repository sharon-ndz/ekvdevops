module "ssm" {
  source = "../../terraform-modules/ssm"

  lambda_env_param_name = var.lambda_env_param_name
  env_variables         = var.env_variables
  tags                  = var.tags
}

