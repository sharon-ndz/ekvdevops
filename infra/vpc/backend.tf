terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt4321"
    key    = "stage-btl-idlms-backend-api-tfstate"
    region = "eu-west-1"
    encrypt = true
  }
}

