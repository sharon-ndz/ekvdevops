terraform {
  backend "s3" {
    bucket = "back-up-tester"
    key    = "dev/api/terraform.tfstate"
    region = "us-east-1"
  }
}

