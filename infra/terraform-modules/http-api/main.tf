resource "aws_apigatewayv2_api" "this" {
  name          = "${var.environment}-http-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "this" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.http_api.arn
    format = jsonencode({
      requestId                = "$context.requestId"
      apiId                    = "$context.apiId"
      domainName               = "$context.domainName"
      domainPrefix             = "$context.domainPrefix"
      stage                    = "$context.stage"
      routeKey                 = "$context.routeKey"
      protocol                 = "$context.protocol"
      httpMethod               = "$context.httpMethod"
      path                     = "$context.path"
      status                   = "$context.status"
      responseLatency          = "$context.responseLatency"
      responseLength           = "$context.responseLength"
      integrationStatus        = "$context.integration.status"
      integrationLatency       = "$context.integration.latency"
      integrationServiceStatus = "$context.integration.integrationStatus"
      integrationError         = "$context.integration.error"
      ip                       = "$context.identity.sourceIp"
      userAgent                = "$context.identity.userAgent"
    })
  }
}

resource "aws_apigatewayv2_vpc_link" "this" {
  name               = "${var.environment}-http-api-vpc-link"
  subnet_ids         = var.vpc_link_subnet_ids
  security_group_ids = var.security_group_ids
  tags               = var.tags
}

resource "aws_apigatewayv2_integration" "this" {
  for_each               = var.api_routes
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "HTTP_PROXY"
  connection_type        = "VPC_LINK"
  connection_id          = aws_apigatewayv2_vpc_link.this.id
  integration_method     = "ANY"
  integration_uri        = each.value
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_route" "this" {
  for_each   = var.api_routes
  api_id     = aws_apigatewayv2_api.this.id
  route_key  = "ANY ${each.key}"
  target     = "integrations/${aws_apigatewayv2_integration.this[each.key].id}"
}

resource "aws_apigatewayv2_route" "proxy" {
  for_each  = var.api_routes
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "ANY ${each.key}/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.this[each.key].id}"
}

resource "aws_cloudwatch_log_group" "http_api" {
  name              = "/aws/http-api/${var.environment}"
  retention_in_days = var.log_retention_days
  tags              = var.tags
}
