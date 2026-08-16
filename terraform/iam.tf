# IAM role for EC2 to use SSM
resource "aws_iam_role" "ssm_role" {
  name = "logs-monitoring-ssm-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "ec2.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ssm_profile" {
  name = "logs-monitoring-ssm-profile"
  role = aws_iam_role.ssm_role.name

  tags = {
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}