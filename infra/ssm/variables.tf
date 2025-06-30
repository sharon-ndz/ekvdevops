variable "environment" {
  type = string
}

variable "region" {
  description = "AWS region to deploy resources into"
  type        = string
}

variable "app_env_content" {
  type        = string
  description = "The contents of the .env file"
}
