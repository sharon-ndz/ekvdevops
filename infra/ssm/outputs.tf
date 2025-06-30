output "ssm_env_param_name" {
  value = aws_ssm_parameter.app_env.name
}

output "ssm_parameter_version" {
  value = aws_ssm_parameter.app_env.version
}
