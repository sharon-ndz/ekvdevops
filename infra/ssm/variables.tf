variable "lambda_env_param_name" {
  description = "Name of the SSM parameter to create"
  type        = string
}

variable "env_variables" {
  description = "Map of environment variables to store as JSON"
  type        = map(string)

}

variable "tags" {
  description = "Tags to apply to the SSM parameter"
  type        = map(string)

}

