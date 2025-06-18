###https://www.terraform.io/docs/language/settings/backends/s3.html#workspace_key_prefix
terraform {
  backend "s3" {
    bucket = "my-terraform-state-bckt43"
    key    = "stage/nlb/terraform.tfstate"
    region = "us-east-1"
    encrypt = true
  }
}
