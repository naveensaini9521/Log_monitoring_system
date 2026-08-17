# AWS Configuration
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-south-1"
}

# Instance Configuration
variable "instance_type" {
  description = "EC2 instance type for app servers"
  type        = string
  default     = "t4g.small"
}

variable "db_instance_type" {
  description = "EC2 instance type for database servers"
  type        = string
  default     = "t4g.small"
}

variable "instance_name" {
  description = "Base name for instances"
  type        = string
  default     = "logs-monitoring-server"
}

# Network Configuration
variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

# SSH Configuration
variable "key_name" {
  description = "SSH key pair name"
  type        = string
  default     = "devops_ssh"
}

variable "bastion_allowed_ip" {
  description = "CIDR block for bastion SSH access"
  type        = string
  default     = "157.48.210.120/32"
}

# Database Configuration
variable "db_name" {
  description = "Database name"
  type        = string
  default     = "logs_monitoring_system"
}

variable "db_username" {
  description = "Database username"
  type        = string
  default     = "log-monitoring-app"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
  default     = "Admin#123"
}

variable "db_replication_password" {
  description = "Database replication password"
  type        = string
  sensitive   = true
  default     = "ReplicaPass!123"
}

# Database Slave Configuration
variable "db_slave_count" {
  description = "Number of database slave instances"
  type        = number
  default     = 1
}

# Application Configuration
variable "app_port" {
  description = "Application port"
  type        = number
  default     = 80
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

# Auto Scaling Configuration - UPDATED for 2 instances
variable "asg_desired_capacity" {
  description = "Desired capacity for ASG"
  type        = number
  default     = 2
}

variable "asg_min_size" {
  description = "Minimum size for ASG"
  type        = number
  default     = 2
}

variable "asg_max_size" {
  description = "Maximum size for ASG"
  type        = number
  default     = 2
}