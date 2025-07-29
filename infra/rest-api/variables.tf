variable "region" {
  description = "AWS region"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, stage, prod)"
  type        = string
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
}

variable "log_retention_days" {
  description = "Log retention in days for CloudWatch"
  type        = number
}

variable "api_description" {
  description = "API Gateway description"
  type        = string
}

variable "binary_media_types" {
  description = "List of binary media types"
  type        = list(string)
}

variable "common_tags" {
  description = "Common tags applied to all resources"
  type        = map(string)
}

variable "throttling_rate_limit" {
  description = "Rate limit for the API Gateway stage"
  type        = number
}

variable "throttling_burst_limit" {
  description = "Burst limit for the API Gateway stage"
  type        = number
}

variable "metrics_enabled" {
  description = "Enable CloudWatch metrics for API Gateway stage"
  type        = bool

}

variable "logging_level" {
  description = "Logging level for API Gateway stage"
  type        = string
}

variable "data_trace_enabled" {
  description = "Enable full data trace logging for API Gateway stage"
  type        = bool

}

variable "api_port" {
  description = "Port number used for API Gateway integration"
  type        = number
}

variable "tf_state_bucket" {
  description = "Name of the S3 bucket storing Terraform remote state"
  type        = string
}

variable "tf_state_region" {
  description = "Region of the Terraform backend bucket"
  type        = string
}
