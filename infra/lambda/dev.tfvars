function_name  = "backend-api-dev"
lambda_package = "backend-api.zip"
handler        =  "dist/lambda.handler"
runtime        = "nodejs18.x"
memory_size    =510
timeout        = 40
region = "us-east-1"
tags = {
  Environment = "dev"
  Project     = "backend-api"
}

vpc_cidr             = "10.20.0.0/16"
subnet_azs           = ["us-east-1a", "us-east-1b"]
subnet_cidrs         = ["10.20.1.0/24", "10.20.2.0/24"]
resource_name_prefix = "lambda-dev"
public_subnet_cidr = "10.20.3.0/24"

ssm_env_params = {
  PORT                      = "/idlms/lambda/dev/PORT"
  APP_NAME                  = "/idlms/lambda/dev/APP_NAME"
  NODE_ENV                  = "/idlms/lambda/dev/NODE_ENV"
  SALT_ROUNDS               = "/idlms/lambda/dev/SALT_ROUNDS"
  JWT_SECRET                = "/idlms/lambda/dev/JWT_SECRET"
  API_CLIENT_JWT_EXPIRES_IN = "/idlms/lambda/dev/API_CLIENT_JWT_EXPIRES_IN"
  EMAIL_SENDER              = "/idlms/lambda/dev/EMAIL_SENDER"
  AUTO_RUN_MIGRATIONS       = "/idlms/lambda/dev/AUTO_RUN_MIGRATIONS"
  DB_HOST                   = "/idlms/lambda/dev/DB_HOST"
  DB_PORT                   = "/idlms/lambda/dev/DB_PORT"
  DB_USERNAME               = "/idlms/lambda/dev/DB_USERNAME"
  DB_PASSWORD               = "/idlms/lambda/dev/DB_PASSWORD"
  DB_NAME                   = "/idlms/lambda/dev/DB_NAME"
  EMAIL_PORT                = "/idlms/lambda/dev/EMAIL_PORT"
  EMAIL_HOST                = "/idlms/lambda/dev/EMAIL_HOST"
  EMAIL_SECURE              = "/idlms/lambda/dev/EMAIL_SECURE"
  LOCAL_URL                 = "/idlms/lambda/dev/LOCAL_URL"
  ORIGINS                   = "/idlms/lambda/dev/ORIGINS"
  JWT_OTP_KEY               = "/idlms/lambda/dev/JWT_OTP_KEY"
  STAGING_URL               = "/idlms/lambda/dev/STAGING_URL"
}
