# ALB Outputs
output "alb_dns_name" {
  description = "ALB DNS name"
  value       = aws_lb.app.dns_name
}

# Bastion Outputs
output "bastion_public_ip" {
  description = "Bastion host public IP"
  value       = aws_instance.bastion.public_ip
}

# Application Server Outputs
output "app_asg_names" {
  description = "Application ASG names"
  value       = [for asg in aws_autoscaling_group.app : asg.name]
}

# Database Outputs
output "db_master_asg_name" {
  description = "Database master ASG name"
  value       = aws_autoscaling_group.db_primary.name
}

output "db_slave_asg_names" {
  description = "Database slave ASG names"
  value       = [for asg in aws_autoscaling_group.db_secondary : asg.name]
}

# Network Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_id" {
  description = "Private subnet ID"
  value       = aws_subnet.private.id
}

# Security Group Outputs
output "security_group_ids" {
  description = "Security group IDs"
  value = {
    alb     = aws_security_group.alb_sg.id
    bastion = aws_security_group.bastion_sg.id
    app     = aws_security_group.app_sg.id
    db      = aws_security_group.db_sg.id
  }
}

# Infrastructure Summary
output "infrastructure_summary" {
  description = "Summary of all infrastructure components"
  value = {
    alb_dns        = aws_lb.app.dns_name
    bastion_ip     = aws_instance.bastion.public_ip
    vpc_id         = aws_vpc.main.id
    public_subnets = aws_subnet.public[*].cidr_block
    private_subnet = aws_subnet.private.cidr_block
    app_asg_names  = [for asg in aws_autoscaling_group.app : asg.name]
    db_master_asg  = aws_autoscaling_group.db_primary.name
    db_slave_asgs  = [for asg in aws_autoscaling_group.db_secondary : asg.name]
    environment    = var.environment
  }
}