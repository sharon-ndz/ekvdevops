output "api_gateway_url" {
  value = "https://${module.api-gateway.rest_api_id}.execute-api.${var.region}.amazonaws.com/${var.api_stage_name}"
}

output "api_key_value" {
  value     = aws_api_gateway_api_key.this.value
  sensitive = true
}

output "api_log_group_name" {
  value = module.api-gateway.log_group_name
}

output "api_stage_arn" {
  value = module.api-gateway.stage_arn
}
