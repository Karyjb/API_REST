resource "aws_dynamodb_table" "trip_users" {
  name           = "trip-users"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_iam_policy" "policy_trip_users" {
  name        = "policy-trip-users"
  description = "My test policy"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "*"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:dynamodb:us-east-1:227252728899:table/trip-users"
      },
      
      {
        Effect = "Allow"

        Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        ]
        Resource = "arn:aws:logs:*:*:*"
     },

     {
        Effect = "Allow"

        Action = [
        "lambda:InvokeFunction",
        ]
        Resource = "arn:aws:execute-api:us-east-1:227252728899:qcrf0w0pd1/*"

     },
    ]
  })

}