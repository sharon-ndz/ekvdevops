data "terraform_remote_state" "lambda-idlms" {
  backend = "s3"
  config = {
    bucket = "my-terraform-state-bckt43"
    key    = "dev/lambda/terraform.tfstate"
    region = "us-east-1"
  }
}
