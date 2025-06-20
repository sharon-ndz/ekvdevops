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

variable "api_tf_state_bucket" {
  type        = string
  description = "S3 bucket name for Terraform remote state of API"
}

variable "api_tf_state_key" {
  type        = string
  description = "S3 key path for API remote state"
}

variable "api_tf_state_region" {
  type        = string
  description = "Region for the API remote state backend"
}
