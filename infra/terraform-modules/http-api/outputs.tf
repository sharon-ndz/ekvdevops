# --- outputs.tf ---

output "http_api_endpoint" {
  description = "Invoke URL of the HTTP API"
  value       = aws_apigatewayv2_api.this.api_endpoint
}

output "http_api_log_group" {
  description = "Name of the HTTP API log group"
  value       = aws_cloudwatch_log_group.http_api.name
}
