# ALB Security Group
resource "aws_security_group" "alb_sg" {
  name        = "log-monitoring-alb-sg"
  description = "Security Group for ALB"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

    ipv6_cidr_blocks = ["::/0"]
  }


  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

    ipv6_cidr_blocks = ["::/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "log-monitoring-alb-sg"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

# Bastion Security Group
resource "aws_security_group" "bastion_sg" {
  name        = "log-monitoring-bastion-sg"
  description = "Bastion - allow SSH from whitelisted IP"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.bastion_allowed_ip]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "log-monitoring-bastion-sg"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

# App Security Group
resource "aws_security_group" "app_sg" {
  name        = "log-monitoring-app-sg"
  description = "App instances - HTTP from ALB and SSH from Bastion"
  vpc_id      = aws_vpc.main.id

  ingress {
  from_port       = -1
  to_port         = -1
  protocol        = "icmp"
  security_groups = [aws_security_group.bastion_sg.id]
}
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "log-monitoring-app-sg"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

# Database Security Group
resource "aws_security_group" "db_sg" {
  name        = "log-monitoring-db-sg"
  description = "DB instances - allow MySQL from App and SSH from Bastion"
  vpc_id      = aws_vpc.main.id

  ingress {
  from_port       = -1
  to_port         = -1
  protocol        = "icmp"
  security_groups = [aws_security_group.bastion_sg.id]
}
  ingress {
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  ingress {
    from_port = 3306
    to_port   = 3306
    protocol  = "tcp"
    self      = true
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "log-monitoring-db-sg"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}