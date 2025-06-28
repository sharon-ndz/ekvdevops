# --- variables.tf ---

variable "environment" {
  description = "Deployment environment (e.g. dev, stage)"
  type        = string
}

variable "nlb_dns_name" {
  description = "DNS name of the Network Load Balancer"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

variable "log_retention_days" {
  description = "Retention in days for CloudWatch logs"
  type        = number
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for VPC link"
  type        = list(string)
}

variable "security_group_ids" {
  description = "Security group IDs for VPC link"
  type        = list(string)
}

variable "nlb_listener_arn" {
  description = "ARN of the NLB Listener"
  type        = string
}

variable "vpc_link_subnet_ids" {
  description = "Subnet IDs for VPC link (only from supported AZs)"
  type        = list(string)
}
