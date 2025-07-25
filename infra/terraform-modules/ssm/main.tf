resource "aws_ssm_parameter" "lambda_env" {
  name  = var.lambda_env_param_name
  type  = "SecureString"
  value = jsonencode(var.env_variables)

  tags = var.tags

  lifecycle {
    ignore_changes = [value]
  }
}
