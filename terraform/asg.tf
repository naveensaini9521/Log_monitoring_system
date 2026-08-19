# APPLICATION LAUNCH TEMPLATE
resource "aws_launch_template" "app" {
  name_prefix            = "logs-monitoring-app-"
  image_id               = data.aws_ami.amazon_linux.id
  instance_type          = var.instance_type
  key_name               = "devops_ssh"
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.ssm_profile.name
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 25
      volume_type = "gp3"
      encrypted   = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Tier        = "app"
      Environment = var.environment
      Project     = "logs_monitoring_system"
    }
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    # Update system
    dnf update -y
    
    # Install Nginx
    dnf install -y nginx
    
    # Start and enable services
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
    systemctl enable nginx
    systemctl start nginx
    
    # Create application directory
    mkdir -p /var/www/logs_monitoring_system
    chown -R ec2-user:ec2-user /var/www/logs_monitoring_system
    
    # Security hardening
    echo "PermitRootLogin no" >> /etc/ssh/sshd_config
    echo "PasswordAuthentication no" >> /etc/ssh/sshd_config
    systemctl restart sshd
    
    # Create a simple index.html for testing
    echo "<h1>Instance ready for Ansible configuration</h1>" > /usr/share/nginx/html/index.html
    
    echo "Instance ready for Ansible configuration"
  EOF
  )

  tags = {
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

# APPLICATION AUTO SCALING GROUP - Creates separate ASG per instance
resource "aws_autoscaling_group" "app" {
  count = var.asg_desired_capacity

  name_prefix         = "logs-monitoring-app-${count.index + 1}-"
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  vpc_zone_identifier = aws_subnet.public[*].id

  launch_template {
    id      = aws_launch_template.app.id
    version = "$Latest"
  }

  target_group_arns         = [aws_lb_target_group.app.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  depends_on = [
    aws_lb_target_group.app,
    aws_subnet.public,
    aws_launch_template.app
  ]

  tag {
    key                 = "Name"
    value               = "logs-monitoring-server-${count.index + 1}"
    propagate_at_launch = true
  }

  tag {
    key                 = "Server-Number"
    value               = count.index + 1
    propagate_at_launch = true
  }

  tag {
    key                 = "Tier"
    value               = "app"
    propagate_at_launch = true
  }

  tag {
    key                 = "Environment"
    value               = var.environment
    propagate_at_launch = true
  }

  tag {
    key                 = "Project"
    value               = "logs-monitoring"
    propagate_at_launch = true
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      desired_capacity,
      launch_template
    ]
  }
}