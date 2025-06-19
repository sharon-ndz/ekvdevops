resource "aws_iam_role" "ec2_ssm_role" {
  name = var.ec2_ssm_role_name

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = var.ssm_policy_arn
}

resource "aws_iam_instance_profile" "ec2_ssm_profile" {
  name = var.ec2_ssm_profile_name
  role = aws_iam_role.ec2_ssm_role.name
}

resource "aws_iam_role_policy_attachment" "cloudwatch_logs" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = var.cloudwatch_agent_policy_arn
}
