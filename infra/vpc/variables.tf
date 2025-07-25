variable "vpc_name" {}
variable "cidr_block" {}

variable "public_subnets" {
  type = list(object({
    cidr_block = string
    az         = string
  }))
}

variable "private_subnets" {
  type = list(object({
    cidr_block = string
    az         = string
  }))
}

variable "enable_nat_gateway" {
  type    = bool
  default = true
}

variable "tags" {
  type = map(string)
}

