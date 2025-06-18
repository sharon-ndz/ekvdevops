variable "environment" {
  type        = string
  description = "Deployment environment (e.g. dev, stage, prod)"
  default     = "stage"
}

variable "region" {
  type        = string
  description = "AWS Region"
  default     = "us-east-1"
}

variable "access_logs_prefix" {
  description = "Prefix for NLB access logs in the S3 bucket"
  type        = string
  default     = "stage/nlb"
}
