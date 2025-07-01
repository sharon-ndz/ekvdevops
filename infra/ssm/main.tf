resource "aws_ssm_parameter" "app_env" {
  name        = "/idlms/shared/${var.environment}/.env"
  description = "Shared environment variables for IDLMS in ${var.environment}"
  type        = "String"
  value       = base64decode(var.app_env_content)
  tags = {
    Environment = var.environment
    App         = "idlms"
  }
}

