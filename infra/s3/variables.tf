variable "environment" {
  description = "Deployment environment"
  type        = string
}


variable "enable_versioning" {
  description = "Enable versioning on the S3 bucket"
  type        = bool
}

variable "tf_state_bucket" {
  description = "Terraform remote state S3 bucket name"
  type        = string
}

