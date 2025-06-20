variable "environment" {
  description = "Deployment environment (dev, stage, prod)"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "waf_rate_limit" {
  description = "Maximum requests per 5 minutes per IP"
  type        = number
}

variable "api_gateway_stage_arn" {
  description = "API Gateway Stage ARN to associate with WAF"
  type        = string
}
