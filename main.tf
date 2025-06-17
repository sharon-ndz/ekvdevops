resource "aws_cloudwatch_log_group" "docker_api" {
  name              = "/docker/api"
  retention_in_days = 7

  tags = {
    Name = "DockerAPI"
  }
}
