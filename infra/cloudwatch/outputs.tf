output "docker_log_group" {
  description = "CloudWatch log group name for Docker API"
  value       = module.cloudwatch.docker_log_group
}
