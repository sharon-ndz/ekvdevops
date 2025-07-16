output "api_gateway_url" {
  value = "https://${aws_api_gateway_rest_api.this.id}.execute-api.${var.region}.amazonaws.com/${var.stage_name}"
}

output "log_group_name" {
  value = aws_cloudwatch_log_group.api_logs.name
}
