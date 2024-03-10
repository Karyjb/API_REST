/*# Create a bucket
resource "aws_s3_bucket" "trip_users_bucket" {

  bucket = "trip-users-bucket"

  acl    = "private"   # or can be "public-read"

  tags = {

    Name        = "My bucket"

    Environment = "Dev"

  }

}

resource "aws_s3_bucket_object" "object" {
bucket = aws_s3_bucket.trip_users_bucket.id
key = "trip-users-lambda.zip"
source = "../trip-users-lambda/trip-users-lambda.zip"
etag = filemd5("../trip-users-lambda/trip-users-lambda.zip")
}*/
