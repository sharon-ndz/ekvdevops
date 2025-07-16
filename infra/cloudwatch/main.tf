module "cloudwatch" {
  source = "../terraform-modules/cloudwatch"

  environment                 = var.environment
  region                      = var.region
  tf_state_bucket             = var.tf_state_bucket
  # access_logs_bucket          = var.access_logs_bucket          
  # access_logs_prefix          = var.access_logs_prefix           
  log_group_tag_name          = var.log_group_tag_name
  retention_in_days           = var.retention_in_days
  ssm_param_name              = var.ssm_param_name
  metrics_collection_interval = var.metrics_collection_interval
  cloudwatch_agent_logfile    = var.cloudwatch_agent_logfile
  docker_log_file_path        = var.docker_log_file_path
  docker_log_group_name       = var.docker_log_group_name
  log_stream_name             = var.log_stream_name
  timezone                    = var.timezone
  ssm_tag_name                = var.ssm_tag_name
  # nlb_logs_bucket_tag_name    = var.nlb_logs_bucket_tag_name     
}

provider "aws" {
  region = var.region
}
