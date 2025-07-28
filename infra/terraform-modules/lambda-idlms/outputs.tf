output "function_name" {
  value = aws_lambda_function.this.function_name
}

output "function_invoke_arn" {
  value = aws_lambda_function.this.invoke_arn
}

output "function_version" {
  value = aws_lambda_function.this.version
}

output "lambda_alias_arn" {
  value = aws_lambda_alias.live.arn
}
