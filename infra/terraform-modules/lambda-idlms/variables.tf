variable "function_name" {}
variable "handler" {}
variable "runtime" {}
variable "memory_size" {}
variable "timeout" {}
variable "private_subnet_ids" { type = list(string) }
variable "vpc_id" {}
variable "lambda_env_param_name" {}
variable "lambda_exec_role_name" {}
variable "lambda_sg_name" {}
variable "tags" { type = map(string) }
variable "lambda_package" {
  description = "Path to the Lambda ZIP file"
  type        = string
}
variable "publish" {
  description = "Whether to publish a new version of the Lambda function"
  type        = bool
}
