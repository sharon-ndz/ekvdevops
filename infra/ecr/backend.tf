terraform {
  backend "s3" {
    bucket  = "my-terraform-state-bckt43"       # change to your actual bucket name
    key     = "dev/ecr/terraform.tfstate"       # path for dev; change to stage/prod as needed
    region  = "us-east-1"
    encrypt = true
  }
}
