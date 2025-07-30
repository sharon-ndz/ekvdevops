terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/vpc/terraform.tfstate"
    region = "eu-north-1"
    encrypt = true
  }
}

