terraform {
  backend "s3" {
    key    = "vpc/terraform.tfstate"
    region = "eu-west-1"
    encrypt = true
  }
}

