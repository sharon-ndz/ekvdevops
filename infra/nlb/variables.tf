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


variable "environment" {
  type        = string
  description = "Environment name (e.g., dev, stage, prod)"
 
}

variable "region" {
  type        = string
  description = "The AWS region"
}


variable "stack_name" {
  type        = string
  default     = "idlms-api"
  description = "Base name for NLB and related resources"
}

variable "lb_ingress_port" {
  type        = number
  default     = 4000
  description = "Ingress port for the NLB security group"
}

variable "lb_ingress_cidr_blocks" {
  type        = list(string)
  default     = ["0.0.0.0/0"]
  description = "CIDR blocks allowed to access the load balancer"
}


variable "ssm_param_name" {
  type        = string
  description = "SSM parameter name used by CloudWatch agent"
}

variable "ssm_tag_name" {
  type        = string
  description = "Tag value assigned to the SSM parameter"
}


variable "subnet_with_az" {
  description = "List of objects with AZ and subnet_id used for subnet mapping"
  type = list(object({
    az        = string
    subnet_id = string
  }))
  default = []
}

variable "additional_ports" {
  description = "List of ports the NLB should listen on and forward to"
  type        = list(number)
}

variable "tf_state_bucket" {
  description = "Name of the S3 bucket storing Terraform remote state"
  type        = string
}

variable "tf_state_region" {
  description = "Region of the Terraform backend bucket"
  type        = string
}

