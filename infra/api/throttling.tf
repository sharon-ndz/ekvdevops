resource "aws_api_gateway_api_key" "this" {
  name        = "${var.environment}-api-key"
  description = "API key for throttling and rate limiting"
  enabled     = true
}

resource "aws_api_gateway_usage_plan" "this" {
  name = "${var.environment}-usage-plan"

  api_stages {
    api_id = module.api-gateway.api_gateway_id
    stage  = module.api-gateway.api_stage_name

  }

  throttle_settings {
    rate_limit  = var.api_key_rate_limit
    burst_limit = var.api_key_burst_limit
  }

  quota_settings {
    limit  = var.api_key_quota_limit
    period = var.api_key_quota_period
  }

  depends_on = [module.api-gateway]
}

resource "aws_api_gateway_usage_plan_key" "this" {
  key_id        = aws_api_gateway_api_key.this.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.this.id
}
