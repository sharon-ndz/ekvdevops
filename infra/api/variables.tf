variable "region" {
  type        = string
  description = "AWS region to deploy resources"
}

variable "tf_state_bucket" {
  type        = string
  description = "S3 bucket name for Terraform remote state"
}

variable "vpc_state_key" {
  type        = string
  description = "S3 key path for VPC remote state"
}

variable "nlb_state_key" {
  type        = string
  description = "S3 key path for NLB remote state"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g. dev, stage, prod)"
}

variable "api_key_rate_limit" {
  type        = number
  description = "Rate limit for the API key (requests per second)"
}

variable "api_key_burst_limit" {
  type        = number
  description = "Burst limit for the API key"
}

variable "api_key_quota_limit" {
  type        = number
  description = "Quota limit for the API key (total requests)"
}

variable "api_key_quota_period" {
  type        = string
  description = "Quota period (DAY, WEEK, MONTH)"
}

variable "log_retention_days" {
  type        = number
  description = "Number of days to retain CloudWatch logs"
}

variable "api_gateway_name" {
  description = "Name of the API Gateway"
  type        = string
}

variable "vpc_link_name" {
  description = "Name of the VPC Link for API Gateway"
  type        = string
}

variable "api_stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "default"
}

variable "backend_port" {
  description = "Port of the backend service"
  type        = number
  default     = 4000
}

variable "api_gateway_description" {
  description = "Description for API Gateway"
  type        = string
}

variable "api_log_group_prefix" {
  description = "Prefix for the CloudWatch API Gateway log group"
  type        = string
}
