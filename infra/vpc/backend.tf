terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/lambda/vpc/terraform.tfstate"
    region = "us-east-1"
  }
}

