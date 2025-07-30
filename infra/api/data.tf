data "terraform_remote_state" "lambda-idlms" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state-bckt4321"
    key    = "dev/lambda/terraform.tfstate"
    region = "eu-west-1"
  }
}
