data "aws_caller_identity" "current" {}

resource "aws_lb" "this" {
  name                             = var.name
  load_balancer_type               = var.load_balancer_type
  internal                         = var.internal
  enable_cross_zone_load_balancing = var.enable_cross_zone_load_balancing
  enable_deletion_protection       = var.enable_deletion_protection

  dynamic "subnet_mapping" {
    for_each = var.subnet_mapping
    content {
      subnet_id            = subnet_mapping.value.subnet_id
      allocation_id        = lookup(subnet_mapping.value, "allocation_id", null)
      private_ipv4_address = lookup(subnet_mapping.value, "private_ipv4_address", null)
      ipv6_address         = lookup(subnet_mapping.value, "ipv6_address", null)
    }
  }



  tags = merge(
    var.tags,
    {
      Name = var.name
    }
  )
}

resource "aws_lb_target_group" "multi" {
  for_each    = { for port in var.additional_ports : tostring(port) => port }
  name        = "${var.name}-tg-${each.key}"
  port        = each.value
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    protocol            = "TCP"
    port                = each.value
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 10
    interval            = 30
  }

  tags = merge(var.tags, {
    Name = "${var.name}-tg-${each.key}"
  })
}


resource "aws_lb_target_group_attachment" "multi" {
  for_each = {
    for combo in flatten([
      for port in var.additional_ports : [
        for ip in var.target_ips : {
          key = "${port}-${ip}"
          port = port
          ip   = ip
        }
      ]
    ]) : combo.key => combo
  }

  target_group_arn = aws_lb_target_group.multi[each.value.port].arn
  target_id        = each.value.ip
  port             = each.value.port
}

resource "aws_lb_listener" "this" {
  for_each          = { for port in var.additional_ports : tostring(port) => port }
  load_balancer_arn = aws_lb.this.arn
  port              = each.value
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.multi[each.key].arn
  }
}

