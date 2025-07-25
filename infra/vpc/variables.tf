variable "cidr_block" {
  description = "CIDR block for the VPC"
  type        = string
}

variable "public_subnets" {
  description = "List of public subnet objects with az and cidr_block"
  type = list(object({
    az          = string
    cidr_block  = string
  }))
}

variable "private_subnets" {
  description = "List of private subnet objects with az and cidr_block"
  type = list(object({
    az          = string
    cidr_block  = string
  }))
}

variable "vpc_name" {
  description = "Project or VPC name"
  type        = string
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

