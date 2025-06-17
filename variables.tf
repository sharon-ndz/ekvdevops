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
