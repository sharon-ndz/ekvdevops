terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt4321"
    key    = "dev/lambda/vpc/terraform.tfstate"
    region = "eu-west-1"
  }
}

