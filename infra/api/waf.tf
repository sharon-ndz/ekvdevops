resource "aws_wafv2_web_acl" "api_waf" {
  name        = "${var.environment}-api-waf"
  description = "WAF to protect the API Gateway"
  scope       = "REGIONAL" # API Gateway requires regional WAF

  default_action {
    allow {}
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.environment}-waf-metrics"
    sampled_requests_enabled   = true
  }

  rule {
    name     = "LimitRequestsPerIP"
    priority = 1

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 1000  # Max requests per 5 minutes per IP
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${var.environment}-rate-limit"
      sampled_requests_enabled   = true
    }
  }
}

resource "aws_wafv2_web_acl_association" "api_gateway_waf_assoc" {
  resource_arn = aws_api_gateway_stage.default.arn
  web_acl_arn  = aws_wafv2_web_acl.api_waf.arn
}
