module "app_env" {
  source      = "../terraform-modules/ssm"
  name        = var.ssm_param_name
  description = var.ssm_param_description
  type        = "String"
  value       = base64decode(var.app_env_content)
  tags = {
    Environment = var.environment
    App         = var.ssm_param_app_tag
  }
}

