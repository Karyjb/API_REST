resource "aws_api_gateway_rest_api" "trip_api" {
  name        = "trip_api"
  description = "An trip API Gateway"
}

resource "aws_api_gateway_resource" "resource" {
  path_part   = "resource"
  parent_id   = aws_api_gateway_rest_api.trip_api.root_resource_id
  rest_api_id = aws_api_gateway_rest_api.trip_api.id
}

resource "aws_api_gateway_method" "users_method" {
  rest_api_id   = aws_api_gateway_rest_api.trip_api.id
  resource_id   = aws_api_gateway_resource.resource.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "trip_integration" {
  rest_api_id             = aws_api_gateway_rest_api.trip_api.id
  resource_id             = aws_api_gateway_resource.resource.id
  http_method             = aws_api_gateway_method.users_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.trip_lambda.invoke_arn
}


