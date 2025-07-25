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

