

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "trip_lambda" {
  name               = "trip_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}


resource "aws_lambda_function" "trip_lambda" {
  filename         = "trip_lambda.zip"
  function_name    = "trip_lambda"
  role             = aws_iam_role.trip_lambda.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.index.output_base64sha256
  runtime          = "nodejs16.x"
}

data "archive_file" "index" {
  type        = "zip"
  source_file = "index.js"
  output_path = "trip_lambda.zip"
}