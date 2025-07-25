variable "function_name" {}
variable "handler" {}
variable "runtime" {}
variable "memory_size" {}
variable "timeout" {}
variable "lambda_package" {}
variable "private_subnet_ids" { type = list(string) }
variable "vpc_id" {}
variable "lambda_env_param_name" {}
variable "lambda_exec_role_name" {}
variable "lambda_sg_name" {}
variable "tags" { type = map(string) }
