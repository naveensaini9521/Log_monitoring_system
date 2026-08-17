# Elastic IP for NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name        = "logs-monitoring-nat-eip"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }
}

# NAT Gateway in first public subnet
resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public[0].id

  tags = {
    Name        = "logs-monitoring-nat"
    Project     = "logs_monitoring_system"
    Environment = var.environment
  }

  depends_on = [aws_internet_gateway.igw]
}