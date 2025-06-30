resource "aws_ssm_parameter" "app_env" {
  name        = "/idlms/shared/${var.environment}/.env"
  description = "Shared environment variables for IDLMS in ${var.environment}"
  type        = "SecureString"
  value       = file("${path.module}/.env")  # Reference to local .env file
  tags = {
    Environment = var.environment
    App         = "idlms"
  }
}
