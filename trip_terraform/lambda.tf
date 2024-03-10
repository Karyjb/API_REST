
data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com" ] 
    }

    actions = ["sts:AssumeRole"]

  }

}

resource "aws_iam_role" "trip_users_lambda_role" {
  name               = "trip-users-lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  managed_policy_arns = [aws_iam_policy.policy_trip_users.arn]

}


resource "aws_lambda_function" "trip_users_lambda" {
  filename         = "../trip-users-lambda/trip-users-lambda.zip"
  function_name    = "trip-users-lambda"
  role             = aws_iam_role.trip_users_lambda_role.arn
  handler          = "src/index.handler"
  //s3_bucket           = aws_s3_bucket.trip_users_bucket.id
  //s3_key              = "trip-users-lambda.zip"
 // source_code_hash = data.archive_file.index.output_base64sha256
  //source_arn       = {"arn:aws:execute-api:us-east-1:227252728899:qcrf0w0pd1/*"}
  source_code_hash = base64sha256("../trip-users-lambda/trip-users-lambda.zip")
  runtime          = "nodejs16.x"
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.trip_users_lambda.function_name
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:us-east-1:227252728899:${aws_api_gateway_rest_api.trip_api.id}/*/${aws_api_gateway_method.users_method.http_method}${aws_api_gateway_resource.resource.path}"
}