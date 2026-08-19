resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name        = "logs-monitoring-igw"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}