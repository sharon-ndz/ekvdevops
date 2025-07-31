terraform {
  backend "s3" {
    bucket  = "stage-btl-idlms-backend-api-tfstate"   
    key     = "stage/ecr/terraform.tfstate"       
    region  = "eu-west-1"
    encrypt = true
  }
}
