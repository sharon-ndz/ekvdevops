resource "aws_ssm_parameter" "docker_logs_config" {
  name        = var.ssm_param_name
  type        = "String"
  tier        = "Standard"
  overwrite   = true

  value = jsonencode({
    agent = {
      metrics_collection_interval = var.metrics_collection_interval,
      logfile = var.cloudwatch_agent_logfile
    },
    logs = {
      logs_collected = {
        files = {
          collect_list = [
            {
              file_path       = var.docker_log_file_path,
              log_group_name  = var.docker_log_group_name,
              log_stream_name = var.log_stream_name,
              timezone        = var.timezone
            }
          ]
        }
      }
    }
  })

  tags = {
    Name = var.ssm_tag_name
  }
}

