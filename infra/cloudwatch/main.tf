resource "aws_cloudwatch_log_group" "docker_api" {
  name              = var.docker_log_group_name
  retention_in_days = var.retention_in_days
  skip_destroy      = true

  tags = {
    Name = var.log_group_tag_name
  }

  lifecycle {
    prevent_destroy = true
    ignore_changes = [
      name,
      retention_in_days,
      tags
    ]
  }
}

