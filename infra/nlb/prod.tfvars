enable_cross_zone_load_balancing = true
load_balancer_type               = "network"
internal                         = true
enable_deletion_protection       = true
lb_create_sg                     = true

tf_state_bucket = "my-terraform-state-bckt43"

lb_egress_roles = [
  {
    description      = "Allow All Outbound Access"
    from_port        = "0"
    to_port          = "0"
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
    security_groups  = null
    self             = null
  }
]
