variable "environment" {
  type    = string
}

variable "region" {
  description = "AWS region to deploy resources into"
  type        = string
}

variable "image_tag_mutability" {
  type        = string
}

variable "scan_on_push" {
  type        = bool
}

variable "encryption_type" {
  type        = string
}
