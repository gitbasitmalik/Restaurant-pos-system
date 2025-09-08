import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from "@mui/material";
import {
  TrendingUp,
  Restaurant,
  ShoppingCart,
  Refresh,
  TableRestaurant,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { orderservice } from "../services/orderService";
import { Order, Orderstats } from "../types";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const { data: orderstats } = useQuery<Orderstats>({
    queryKey: ["orderstats", refreshKey],
    queryFn: async () => {
      const response = await orderservice.getOrderstats();
      return response.data!;
    },
  });

  const { data: todayOrders } = useQuery<Order[]>({
    queryKey: ["todayOrders", refreshKey],
    queryFn: async () => {
      const response = await orderservice.getTodayOrders();
      return response.data!;
    },
  });

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "info";
      case "preparing":
        return "secondary";
      case "ready":
        return "success";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactElement;
    color: string;
  }> = ({ title, value, icon, color }) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={color}>
              {value}
            </Typography>
          </Box>
          <Box sx={{ color: color }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <IconButton onClick={handleRefresh} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mb: 3,
        }}
      >
        <StatCard
          title="Today's Orders"
          value={orderstats?.todayOrdeRs || 0}
          icon={<ShoppingCart sx={{ fontSize: 40 }} />}
          color="#1976d2"
        />
        <StatCard
          title="Today's Revenue"
          value={`Rs${orderstats?.todayRevenue?.toLocaleString() || 0}`}
          icon={<TrendingUp sx={{ fontSize: 40 }} />}
          color="#2e7d32"
        />
        <StatCard
          title="Pending Orders"
          value={orderstats?.pendingOrdeRs || 0}
          icon={<Restaurant sx={{ fontSize: 40 }} />}
          color="#ed6c02"
        />
        <StatCard
          title="Preparing Orders"
          value={orderstats?.preparingOrdeRs || 0}
          icon={<TableRestaurant sx={{ fontSize: 40 }} />}
          color="#9c27b0"
        />
      </Box>

      {/* Recent Orders */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 3,
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
          <List>
            {todayOrders?.slice(0, 10).map((order, index) => (
              <React.Fragment key={order._id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography variant="subtitle1">
                          {order.orderNumber}
                        </Typography>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status) as any}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          {order.orderType === "dine-in" && order.table
                            ? `Table ${order.table.number}`
                            : order.orderType}
                          {order.customerName && ` • ${order.customerName}`}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Rs{order.total} •{" "}
                          {format(new Date(order.createdAt), "hh:mm a")}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < todayOrders.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {!todayOrders?.length && (
              <ListItem>
                <ListItemText
                  primary="No orders today"
                  secondary="Orders will appear here once they are placed"
                />
              </ListItem>
            )}
          </List>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <Card
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/orders")}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <ShoppingCart sx={{ mr: 2, color: "primary.main" }} />
                  <Typography>New Order</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/tables")}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TableRestaurant sx={{ mr: 2, color: "primary.main" }} />
                  <Typography>Manage Tables</Typography>
                </Box>
              </CardContent>
            </Card>
            <Card
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/menu")}
            >
              <CardContent>
                <Box display="flex" alignItems="center">
                  <Restaurant sx={{ mr: 2, color: "primary.main" }} />
                  <Typography>Menu Items</Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
