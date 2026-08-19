# DATABASE PRIMARY (MASTER) LAUNCH TEMPLATE
resource "aws_launch_template" "db_primary" {
  name_prefix            = "logs-monitoring-db-primary-"
  image_id               = data.aws_ami.amazon_linux.id
  instance_type          = var.db_instance_type
  key_name               = "devops_ssh"
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.ssm_profile.name
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 30
      volume_type = "gp3"
      encrypted   = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Tier        = "db"
      Role        = "master"
      Environment = var.environment
      Project     = "logs_monitoring_system"
    }
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    dnf update -y
    dnf install -y python3 python3-pip nginx mariadb105-server
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
    systemctl enable nginx
    systemctl start nginx
    echo "PermitRootLogin no" >> /etc/ssh/sshd_config
    echo "PasswordAuthentication no" >> /etc/ssh/sshd_config
    systemctl restart sshd
    echo "Database master ready for Ansible configuration"
  EOF
  )

  tags = {
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

# DATABASE PRIMARY (MASTER) AUTO SCALING GROUP - 1 instance
resource "aws_autoscaling_group" "db_primary" {
  name_prefix         = "logs-monitoring-db-master-"
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  vpc_zone_identifier = [aws_subnet.private.id]

  launch_template {
    id      = aws_launch_template.db_primary.id
    version = "$Latest"
  }

  health_check_type         = "EC2"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "logs-monitoring-db-master"
    propagate_at_launch = true
  }
  tag {
    key                 = "Tier"
    value               = "db"
    propagate_at_launch = true
  }
  tag {
    key                 = "Role"
    value               = "master"
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

  depends_on = [
    aws_launch_template.db_primary,
    aws_subnet.private
  ]

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      desired_capacity,
      launch_template
    ]
  }
}

# DATABASE SECONDARY (SLAVE) LAUNCH TEMPLATE
resource "aws_launch_template" "db_secondary" {
  name_prefix            = "logs-monitoring-db-slave-"
  image_id               = data.aws_ami.amazon_linux.id
  instance_type          = var.db_instance_type
  key_name               = "devops_ssh"
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  iam_instance_profile {
    name = aws_iam_instance_profile.ssm_profile.name
  }

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 30
      volume_type = "gp3"
      encrypted   = true
    }
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Tier        = "db"
      Role        = "slave"
      Environment = var.environment
      Project     = "logs_monitoring_system"
    }
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    dnf update -y
    dnf install -y python3 python3-pip nginx mariadb105-server
    systemctl enable amazon-ssm-agent
    systemctl start amazon-ssm-agent
    systemctl enable nginx
    systemctl start nginx
    echo "PermitRootLogin no" >> /etc/ssh/sshd_config
    echo "PasswordAuthentication no" >> /etc/ssh/sshd_config
    systemctl restart sshd
    echo "Database slave ready for Ansible configuration"
  EOF
  )

  tags = {
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

# DATABASE SECONDARY (SLAVE) AUTO SCALING GROUP - 1 instance
resource "aws_autoscaling_group" "db_secondary" {
  count = 1

  name_prefix         = "logs-monitoring-db-slave-${count.index + 1}-"
  desired_capacity    = 1
  max_size            = 1
  min_size            = 1
  vpc_zone_identifier = [aws_subnet.private.id]

  launch_template {
    id      = aws_launch_template.db_secondary.id
    version = "$Latest"
  }

  health_check_type         = "EC2"
  health_check_grace_period = 300

  tag {
    key                 = "Name"
    value               = "logs-monitoring-db-slave-${count.index + 1}"
    propagate_at_launch = true
  }
  tag {
    key                 = "Tier"
    value               = "db"
    propagate_at_launch = true
  }
  tag {
    key                 = "Role"
    value               = "slave"
    propagate_at_launch = true
  }
  tag {
    key                 = "Slave-Number"
    value               = count.index + 1
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

  depends_on = [
    aws_launch_template.db_secondary,
    aws_autoscaling_group.db_primary,
    aws_subnet.private
  ]

  lifecycle {
    create_before_destroy = true
    ignore_changes = [
      desired_capacity,
      launch_template
    ]
  }
}