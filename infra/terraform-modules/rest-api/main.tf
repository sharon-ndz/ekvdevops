resource "aws_iam_role" "api_gw_cloudwatch" {
  name = "${var.environment}-apigw-cloudwatch-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = {
        Service = "apigateway.amazonaws.com"
      },
      Action = "sts:AssumeRole"
    }]
  })

  tags = var.common_tags
}

resource "aws_iam_role_policy_attachment" "api_gw_logs" {
  role       = aws_iam_role.api_gw_cloudwatch.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_api_gateway_account" "account" {
  cloudwatch_role_arn = aws_iam_role.api_gw_cloudwatch.arn
  depends_on          = [aws_iam_role_policy_attachment.api_gw_logs]
}

resource "aws_api_gateway_vpc_link" "this" {
  name        = "${var.environment}-vpc-link"
  target_arns = var.vpc_link_target_arns
  tags        = var.common_tags
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/api-gateway/${var.environment}-api"
  retention_in_days = var.log_retention_days
  tags              = var.common_tags
}

resource "aws_api_gateway_rest_api" "this" {
  name               = "${var.environment}-rest-api-idlms"
  description        = "${var.api_description} — ${timestamp()}"
  binary_media_types = var.binary_media_types

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = var.common_tags
}

resource "aws_api_gateway_method" "root" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_rest_api.this.root_resource_id
  http_method   = "ANY"
  authorization = "NONE"
  api_key_required = false
}

resource "aws_api_gateway_integration" "root" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_rest_api.this.root_resource_id
  http_method             = aws_api_gateway_method.root.http_method
  integration_http_method = "ANY"
  type                    = "HTTP_PROXY"
  uri                     = "http://${var.nlb_dns_name}:${var.api_port}/"
  connection_type         = "VPC_LINK"
  connection_id           = aws_api_gateway_vpc_link.this.id
}


resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  parent_id   = aws_api_gateway_rest_api.this.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = aws_api_gateway_rest_api.this.id
  resource_id   = aws_api_gateway_resource.proxy.id
  http_method   = "ANY"
  authorization = "NONE"
  api_key_required = false

  request_parameters = {
    "method.request.path.proxy" = true
  }
}

resource "aws_api_gateway_integration" "proxy" {
  rest_api_id             = aws_api_gateway_rest_api.this.id
  resource_id             = aws_api_gateway_resource.proxy.id
  http_method             = aws_api_gateway_method.proxy.http_method
  integration_http_method = "ANY"
  type                    = "HTTP_PROXY"
  uri                     = "http://${var.nlb_dns_name}:${var.api_port}/{proxy}"
  connection_type         = "VPC_LINK"
  connection_id           = aws_api_gateway_vpc_link.this.id
  passthrough_behavior    = "WHEN_NO_MATCH"
  content_handling        = "CONVERT_TO_BINARY"

  request_parameters = {
    "integration.request.path.proxy" = "method.request.path.proxy"
  }
}


resource "aws_api_gateway_deployment" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  description = "Deployed on ${timestamp()}"

  depends_on = [
    aws_api_gateway_integration.proxy,

  ]
}

resource "aws_api_gateway_stage" "default" {
  stage_name    = var.stage_name
  rest_api_id   = aws_api_gateway_rest_api.this.id
  deployment_id = aws_api_gateway_deployment.this.id

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      requestId          = "$context.requestId"
      apiId              = "$context.apiId"
      domainName         = "$context.domainName"
      stage              = "$context.stage"
      resourcePath       = "$context.resourcePath"
      resourceId         = "$context.resourceId"
      httpMethod         = "$context.httpMethod"
      path               = "$context.path"
      status             = "$context.status"
      responseLatency    = "$context.responseLatency"
      responseLength     = "$context.responseLength"
      ip                 = "$context.identity.sourceIp"
      caller             = "$context.identity.caller"
      user               = "$context.identity.user"
      userAgent          = "$context.identity.userAgent"
      accountId          = "$context.identity.accountId"
      integrationStatus  = "$context.integration.status"
      integrationLatency = "$context.integration.latency"
      integrationError   = "$context.integration.error"
    })
  }

  depends_on = [
    aws_cloudwatch_log_group.api_logs,
    aws_api_gateway_account.account
  ]

  tags = var.common_tags

}

resource "aws_api_gateway_method_settings" "this" {
  rest_api_id = aws_api_gateway_rest_api.this.id
  stage_name  = var.stage_name
  method_path = "*/*"

  settings {
     metrics_enabled         = var.metrics_enabled
    logging_level           = var.logging_level
    data_trace_enabled      = var.data_trace_enabled
    throttling_burst_limit  = var.throttling_burst_limit
    throttling_rate_limit   = var.throttling_rate_limit

  }

  depends_on = [
    aws_api_gateway_stage.default,
    aws_api_gateway_method.root,
    aws_api_gateway_method.proxy,
 
  ]
}

