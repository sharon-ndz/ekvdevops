tf_state_bucket = "my-terraform-state-bckt43"
environment     = "stage"
region          = "us-east-1"

access_logs_bucket = "nlb-access-logs-stage-nyo9xe"
load_balancer_type = "network"
internal           = true
target_port        = 4000
lb_create_sg       = true
access_logs_prefix = "stage/nlb"

lb_egress_roles = [
  {
    description      = "Allow all outbound"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = []
    security_groups  = []
    self             = false
  }
]

common_tags = {
  Environment = "stage"
  Project     = "IDMS"
}
ssm_param_name         = "/cloudwatch/docker-config"
ssm_tag_name           = "docker-cloudwatch-config"
docker_log_group_name  = "/docker/api"
log_group_tag_name     = "DockerAPI"
