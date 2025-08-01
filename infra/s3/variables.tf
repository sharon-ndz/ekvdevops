variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "enable_versioning" {
  description = "Enable versioning on the S3 bucket"
  type        = bool
}
