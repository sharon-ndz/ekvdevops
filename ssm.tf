resource "aws_ssm_parameter" "docker_logs_config" {
  name  = "/cloudwatch/docker-config"
  type  = "String"
  tier  = "Standard"
  overwrite = true  # <--- ADD THIS LINE to fix the error
  value = jsonencode({
    agent = {
      metrics_collection_interval = 60,
      logfile = "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
    },
    logs = {
      logs_collected = {
        files = {
          collect_list = [
            {
              file_path       = "/var/lib/docker/containers/*/*.log",
              log_group_name  = "/docker/api",
              log_stream_name = "{instance_id}/docker-api",
              timezone        = "UTC"
            }
          ]
        }
      }
    }
  })

  tags = {
    Name = "docker-cloudwatch-config"
  }
}
