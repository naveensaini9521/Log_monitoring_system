# Application Load Balancer
resource "aws_lb" "app" {
  name               = "log-monitoring-alb" 
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = aws_subnet.public[*].id # Use both public subnets

  enable_deletion_protection = false
  enable_http2               = true
  idle_timeout               = 60

  tags = {
    Name        = "log-monitoring-alb"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }

  depends_on = [
    aws_subnet.public,
    aws_security_group.alb_sg
  ]
}

# Target Group
resource "aws_lb_target_group" "app" {
  name     = "logs-monitoring-tg"
  port     = var.app_port
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
    port                = var.app_port
    protocol            = "HTTP"
    matcher             = "200"
  }

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  tags = {
    Name        = "logs-monitoring-tg"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

# HTTP Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}