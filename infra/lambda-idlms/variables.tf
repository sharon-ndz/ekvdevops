variable "function_name" {
  type = string
}

variable "runtime" {
  type = string
}

variable "handler" {
  type = string
}

variable "memory_size" {
  type = number
}

variable "timeout" {
  type = number
}

variable "lambda_package" {
  type = string
}

variable "tags" {
  type = map(string)
}

variable "lambda_env_param_name" {
  type = string
}

variable "lambda_exec_role_name" {
  type        = string
  description = "IAM role name for Lambda execution"
}

variable "lambda_sg_name" {
  type        = string
  description = "Security group name for Lambda"
}

variable "publish" {
  description = "Whether to publish a new version of the Lambda function"
  type        = bool
}
