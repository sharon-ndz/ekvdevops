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

resource "aws_iam_instance_profile" "ec2_ssm_profile" {
  name = var.ec2_ssm_profile_name
  role = aws_iam_role.ec2_ssm_role.name
}

# AmazonSSMManagedInstanceCore
resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = var.ssm_policy_arn # "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# CloudWatch Logs Agent
resource "aws_iam_role_policy_attachment" "cloudwatch_logs" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = var.cloudwatch_agent_policy_arn # "arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy"
}

#  Docker Artifact S3 Read Access
resource "aws_iam_policy" "s3_docker_backup_access" {
  name = "${var.environment}-ec2-s3-docker-backup-access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "s3:GetObject",
          "s3:ListBucket"
        ],
        Resource = [
          "arn:aws:s3:::${var.docker_artifact_bucket}",
          "arn:aws:s3:::${var.docker_artifact_bucket}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "s3_docker_backup_access" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = aws_iam_policy.s3_docker_backup_access.arn
}

#  ECR Pull Access
resource "aws_iam_policy" "ecr_pull" {
  name = "${var.environment}-ec2-ecr-pull-access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecr_pull" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = aws_iam_policy.ecr_pull.arn
}

#  ELBv2 Describe Permissions
resource "aws_iam_policy" "elb_describe" {
  name = "${var.environment}-ec2-elb-describe-access"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "elasticloadbalancing:DescribeTargetHealth",
          "elasticloadbalancing:DescribeLoadBalancers",
          "elasticloadbalancing:DescribeListeners",
          "elasticloadbalancing:DescribeTargetGroups"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "elb_describe" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = aws_iam_policy.elb_describe.arn
}

#  SSM:DescribeInstanceInformation (optional for debugging)
resource "aws_iam_policy" "ssm_debug" {
  name = "${var.environment}-ec2-ssm-describe-instance"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ssm:DescribeInstanceInformation"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_debug" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = aws_iam_policy.ssm_debug.arn
}

resource "aws_iam_policy" "ec2_describe" {
  name = "${var.environment}-ec2-describe-instances"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ec2:DescribeInstances"
        ],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ec2_describe" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = aws_iam_policy.ec2_describe.arn
}

resource "aws_iam_policy" "ssm_get_parameter" {
  name = "${var.environment}-ec2-ssm-get-parameter"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = ["ssm:GetParameter"],
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_get_parameter_attach" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = aws_iam_policy.ssm_get_parameter.arn
}
