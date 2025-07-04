output "lambda_function_name" {
  value = module.lambda.lambda_function_name
}

output "lambda_function_arn" {
  value = module.lambda.lambda_arn  # changed to match available output
}

output "lambda_function_invoke_arn" {
  value = module.lambda.lambda_invoke_arn
}
