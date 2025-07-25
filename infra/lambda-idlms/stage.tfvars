function_name   = "stage-idlms-lambda"
runtime         = "nodejs18.x"
handler         = "dist/lambda.handler"
memory_size     = 512
timeout         = 10
lambda_package  = "builds/lambda.zip"

tags = {
  Owner   = "DevOps"
  Project = "idlms"
}

# The parameter name to fetch from SSM
lambda_env_param_name = "/idlms/lambda/stage/env-vars"

lambda_exec_role_name = "stage-idlms-lambda-exec-role"
lambda_sg_name        = "stage-idlms-lambda-sg"
