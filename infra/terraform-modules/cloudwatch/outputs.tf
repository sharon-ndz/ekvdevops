output "nlb_logs_bucket" {
  description = "S3 bucket used to store NLB access logs"
  value       = var.access_logs_bucket != "" ? aws_s3_bucket.nlb_logs[0].bucket : null
}

output "ssm_param_name" {
  description = "SSM parameter name for CloudWatch config"
  value       = aws_ssm_parameter.docker_logs_config.name
}

output "docker_log_group" {
  description = "Docker API CloudWatch log group name"
  value       = aws_cloudwatch_log_group.docker_api.name
}
