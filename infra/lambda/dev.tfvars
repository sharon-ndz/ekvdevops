function_name  = "backend-api-dev"
lambda_package = "backend-api.zip"
handler        =  "dist/main.handler"
runtime        = "nodejs18.x"
memory_size    = 256
timeout        = 10
lambda_role_arn = "arn:aws:iam::123456789012:role/lambda-execution-role"
environment_variables = {
  ENV   = "dev"
  DEBUG = "true"
}

tags = {
  Environment = "dev"
  Project     = "backend-api"
}

