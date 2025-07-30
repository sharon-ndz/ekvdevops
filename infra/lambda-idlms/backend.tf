terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt4321"
    key    = "dev/lambda/terraform.tfstate"
    region = "eu-west-1"
  }
}
