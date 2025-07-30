tf_state_bucket = "my-terraform-state-bckt43"
tf_state_region  = "us-east-1"
region          = "us-east-1"
environment     = "prod"
load_balancer_type = "network"
internal           = true
target_port        = 4000
lb_create_sg       = true
additional_ports = [4000, 4001, 4002]
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
  Environment = "prod"
  Project     = "IDMS"
}
ssm_param_name         = "/prod-cloudwatch/docker-config"
ssm_tag_name           = "prod-docker-cloudwatch-config"
