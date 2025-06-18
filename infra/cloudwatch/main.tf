resource "aws_cloudwatch_log_group" "docker_api" {
  name              = "/docker/api"
  retention_in_days = 7
  skip_destroy      = true

  tags = {
    Name = "DockerAPI"
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [
      name,
      retention_in_days,
      tags
    ]
  }
}

