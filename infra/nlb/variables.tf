variable "lb_create_sg" {
  type        = bool
  description = "Whether to create security group for the LB"
}

variable "common_tags" {
  type        = map(string)
  description = "Common tags for all resources"
}

variable "load_balancer_type" {
  type        = string
  description = "Type of Load Balancer (application or network)"
}

variable "internal" {
  type        = bool
  description = "Whether the LB is internal or internet-facing"
}

variable "target_port" {
  type        = number
  description = "Port on which the target instances listen"
}

variable "lb_egress_roles" {
  type = list(object({
    description      = string
    from_port        = number
    to_port          = number
    protocol         = string
    cidr_blocks      = list(string)
    ipv6_cidr_blocks = list(string)
    security_groups  = list(string)
    self             = bool
  }))
  description = "Egress rules for the LB security group"
}

variable "tf_state_bucket" {
  type = string
}

variable "environment" {
description = "Environment name (e.g., dev, stage, prod)"
  type = string
}

variable "region" {
  description = "The AWS region"
  type        = string
}

variable "access_logs_prefix" {
  description = "Prefix within the S3 bucket for NLB access logs"
  type        = string
}
