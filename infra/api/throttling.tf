resource "aws_api_gateway_api_key" "this" {
  name        = "${var.environment}-api-key"
  description = "API key for throttling and rate limiting"
  enabled     = true
}

resource "aws_api_gateway_usage_plan" "this" {
  name = "${var.environment}-usage-plan"

  api_stages {
    api_id = aws_api_gateway_rest_api.this.id
    stage  = aws_api_gateway_stage.default.stage_name
  }

  throttle_settings {
    rate_limit  = 5
    burst_limit = 10
  }

  quota_settings {
    limit  = 10000
    period = "MONTH"
  }
}

resource "aws_api_gateway_usage_plan_key" "this" {
  key_id        = aws_api_gateway_api_key.this.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.this.id
}
