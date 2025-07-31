terraform {
  backend "s3" {
    bucket = "stage-btl-idlms-backend-api-tfstate"
    key    = "stage/cloudwatch/terraform.tfstate"
    region = "eu-west-1"
  }
}
