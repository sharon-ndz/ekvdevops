module "lambda" {
  source               = "../terraform-modules/lambda-idlms"
  
  function_name            = var.function_name
  handler                  = var.handler
  runtime                  = var.runtime
  memory_size              = var.memory_size
  timeout                  = var.timeout
  lambda_package           = var.lambda_package
  vpc_id                   = data.terraform_remote_state.vpc.outputs.vpc_id
  private_subnet_ids       = data.terraform_remote_state.vpc.outputs.private_subnet_ids
  lambda_env_param_name    = var.lambda_env_param_name
  lambda_exec_role_name    = var.lambda_exec_role_name
  lambda_sg_name           = var.lambda_sg_name
  tags                     = var.tags
}
