terraform {
  backend "s3" {
    bucket = "back-up-tester"
    key    = "dev/lambda/terraform.tfstate"
    region = "us-east-1"
  }
}
