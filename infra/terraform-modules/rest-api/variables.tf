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
