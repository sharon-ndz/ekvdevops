variable "name" {
  type        = string
  description = "Name of the ECR repository"
}

variable "image_tag_mutability" {
  type        = string
  description = "Whether image tags are mutable or immutable"
}

variable "scan_on_push" {
  type        = bool
  description = "Whether to enable image scan on push"
}

variable "encryption_type" {
  type        = string
  description = "Type of encryption to use"
}

variable "tags" {
  type        = map(string)
  description = "Tags to apply to the ECR repository"
}
