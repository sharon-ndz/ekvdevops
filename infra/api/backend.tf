terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/lambda/api/terraform.tfstate"
    region = "us-east-1"
  }
}

