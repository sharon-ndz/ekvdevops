data "terraform_remote_state" "api" {
  backend = "s3"

  config = {
    bucket = var.api_tf_state_bucket
    key    = var.api_tf_state_key
    region = var.api_tf_state_region
  }
}
