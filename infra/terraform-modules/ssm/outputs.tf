output "ssm_parameter_name" {
  value = aws_ssm_parameter.this.name
}

output "ssm_parameter_version" {
  value = aws_ssm_parameter.this.version
}
