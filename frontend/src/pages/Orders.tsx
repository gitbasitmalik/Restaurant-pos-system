import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Visibility, Edit, Payment, Refresh } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderservice } from "../services/orderService";
import { Order } from "../types";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Orders: React.FC = () => {
  const [tabValue, setTabValue] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("");

  const queryClient = useQueryClient();

  const { data: orders, refetch } = useQuery<Order[]>({
    queryKey: ["orders", tabValue],
    queryFn: async () => {
      const params = tabValue !== "all" ? { status: tabValue } : {};
      const response = await orderservice.getOrders(params);
      return response.data!;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderservice.updateOrderstatus(id, status),
    onSuccess: () => {
      toast.success("Order status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setStatusDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update order status"
      );
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({
      id,
      paymentStatus,
      paymentMethod,
    }: {
      id: string;
      paymentStatus: string;
      paymentMethod: string;
    }) => orderservice.updatePaymentStatus(id, paymentStatus, paymentMethod),
    onSuccess: () => {
      toast.success("Payment status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setPaymentDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update payment status"
      );
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusDialogOpen(true);
  };

  const handleUpdatePayment = (order: Order) => {
    setSelectedOrder(order);
    setNewPaymentStatus(order.paymentStatus);
    setNewPaymentMethod(order.paymentMethod);
    setPaymentDialogOpen(true);
  };

  const handleConfirmStatusUpdate = () => {
    if (selectedOrder && newStatus) {
      updateStatusMutation.mutate({
        id: selectedOrder._id,
        status: newStatus,
      });
    }
  };

  const handleConfirmPaymentUpdate = () => {
    if (selectedOrder && newPaymentStatus && newPaymentMethod) {
      updatePaymentMutation.mutate({
        id: selectedOrder._id,
        paymentStatus: newPaymentStatus,
        paymentMethod: newPaymentMethod,
      });
    }
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
      case "served":
        return "success";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "paid":
        return "success";
      case "refunded":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Orders
        </Typography>
        <IconButton onClick={() => refetch()} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Orders" value="all" />
          <Tab label="Pending" value="pending" />
          <Tab label="Preparing" value="preparing" />
          <Tab label="Ready" value="ready" />
          <Tab label="Completed" value="completed" />
        </Tabs>
      </Paper>

      <Paper>
        <List>
          {orders?.map((order, index) => (
            <React.Fragment key={order._id}>
              <ListItem
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="h6">{order.orderNumber}</Typography>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                      <Chip
                        label={order.paymentStatus}
                        color={
                          getPaymentStatusColor(order.paymentStatus) as any
                        }
                        size="small"
                        variant="outlined"
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
                        Rs{order.total.toFixed(2)} •{" "}
                        {format(
                          new Date(order.createdAt),
                          "MMM dd, yyyy hh:mm a"
                        )}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Items: {order.items.length}
                      </Typography>
                    </Box>
                  }
                />
                <Box display="flex" gap={1}>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleViewOrder(order)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleUpdateStatus(order)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="success"
                    onClick={() => handleUpdatePayment(order)}
                  >
                    <Payment />
                  </IconButton>
                </Box>
              </ListItem>
              {index < orders.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {!orders?.length && (
            <ListItem>
              <ListItemText
                primary="No orders found"
                secondary="Orders will appear here once they are placed"
              />
            </ListItem>
          )}
        </List>
      </Paper>

      {/* View Order Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Order Information
                  </Typography>
                  <Typography>
                    <strong>Type:</strong> {selectedOrder.orderType}
                  </Typography>
                  {selectedOrder.table && (
                    <Typography>
                      <strong>Table:</strong> {selectedOrder.table.number}
                    </Typography>
                  )}
                  {selectedOrder.customerName && (
                    <Typography>
                      <strong>Customer:</strong> {selectedOrder.customerName}
                    </Typography>
                  )}
                  {selectedOrder.customerPhone && (
                    <Typography>
                      <strong>Phone:</strong> {selectedOrder.customerPhone}
                    </Typography>
                  )}
                  <Typography>
                    <strong>Status:</strong> {selectedOrder.status}
                  </Typography>
                  <Typography>
                    <strong>Payment:</strong> {selectedOrder.paymentStatus} (
                    {selectedOrder.paymentMethod})
                  </Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Items
                  </Typography>
                  {selectedOrder.items.map((item, index) => (
                    <Box
                      key={index}
                      display="flex"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography>
                        {item.menuItem.name} x{item.quantity}
                      </Typography>
                      <Typography>
                        Rs{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                  <Divider sx={{ my: 2 }} />
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Subtotal:</Typography>
                    <Typography>
                      Rs{selectedOrder.subtotal.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography>Tax:</Typography>
                    <Typography>Rs{selectedOrder.tax.toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">
                      Rs{selectedOrder.total.toFixed(2)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
      >
        <DialogTitle>Update Order Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              label="Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="preparing">Preparing</MenuItem>
              <MenuItem value="ready">Ready</MenuItem>
              <MenuItem value="served">Served</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmStatusUpdate}
            variant="contained"
            disabled={updateStatusMutation.isPending}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Payment Dialog */}
      <Dialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
      >
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={newPaymentStatus}
              onChange={(e) => setNewPaymentStatus(e.target.value)}
              label="Payment Status"
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={newPaymentMethod}
              onChange={(e) => setNewPaymentMethod(e.target.value)}
              label="Payment Method"
            >
              <MenuItem value="cash">Cash</MenuItem>
              <MenuItem value="card">Card</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
              <MenuItem value="online">Online</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmPaymentUpdate}
            variant="contained"
            disabled={updatePaymentMutation.isPending}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
