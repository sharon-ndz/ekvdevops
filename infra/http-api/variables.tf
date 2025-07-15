# --- variables.tf ---

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
}

variable "tf_state_bucket" {
  description = "Terraform remote state S3 bucket"
  type        = string
}

variable "common_tags" {
  description = "Common tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
}

variable "path_to_port_map" {
  description = "Map of API paths to NLB listener ports"
  type        = map(string)
}
