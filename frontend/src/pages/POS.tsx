import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Chip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Select,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Add,
  Remove,
  ShoppingCart,
  Delete,
  Person,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { menuService } from "../services/menuService";
import { orderservice } from "../services/orderService";
import { useCart } from "../context/CartContext";
import { Category, MenuItem, Table } from "../types";
import { toast } from "react-toastify";

const POS: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [orderType, setOrderType] = useState<
    "dine-in" | "takeaway" | "delivery"
  >("dine-in");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const {
    items: cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getSubtotal,
    getTax,
    getTotal,
  } = useCart();

  const queryClient = useQueryClient();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await menuService.getCategories();
      return response.data!;
    },
  });

  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["menuItems", selectedCategory],
    queryFn: async () => {
      const params =
        selectedCategory !== "all" ? { category: selectedCategory } : {};
      const response = await menuService.getMenuItems(params);
      return response.data!;
    },
  });

  const { data: availableTables } = useQuery<Table[]>({
    queryKey: ["availableTables"],
    queryFn: async () => {
      const response = await orderservice.getAvailableTables();
      return response.data!;
    },
    enabled: orderType === "dine-in",
  });

  const createOrderMutation = useMutation({
    mutationFn: orderservice.createOrder,
    onSuccess: () => {
      toast.success("Order created successfully!");
      clearCart();
      setOrderDialogOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setSelectedTable("");
      queryClient.invalidateQueries({ queryKey: ["ordeRs"] });
      queryClient.invalidateQueries({ queryKey: ["availableTables"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create order");
    },
  });

  const handleCategoryChange = (
    event: React.SyntheticEvent,
    newValue: string
  ) => {
    setSelectedCategory(newValue);
  };

  const handleAddToCart = (item: MenuItem) => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    setOrderDialogOpen(true);
  };

  const handleConfirmOrder = () => {
    if (orderType === "dine-in" && !selectedTable) {
      toast.error("Please select a table");
      return;
    }

    if (
      orderType === "delivery" &&
      (!customerName || !customerPhone || !customerAddress)
    ) {
      toast.error("Please fill in all customer details for delivery");
      return;
    }

    const orderData: any = {
      orderType,
      table: orderType === "dine-in" ? selectedTable : undefined,
      customerName: orderType !== "dine-in" ? customerName : undefined,
      customerPhone: orderType !== "dine-in" ? customerPhone : undefined,
      customerAddress: orderType === "delivery" ? customerAddress : undefined,
      items: cartItems.map((item) => ({
        menuItem: item._id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
      })),
      subtotal: getSubtotal(),
      tax: getTax(),
      total: getTotal(),
    };

    createOrderMutation.mutate(orderData);
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
          Point of Sale
        </Typography>
        <Button
          variant="contained"
          startIcon={
            <Badge badgeContent={getItemCount()} color="error">
              <ShoppingCart />
            </Badge>
          }
          onClick={() => setCartOpen(true)}
        >
          View Cart (Rs{getTotal().toFixed(2)})
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Menu Categories */}
        <Paper sx={{ p: 2 }}>
          <Tabs
            value={selectedCategory}
            onChange={handleCategoryChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Items" value="all" />
            {categories?.map((category) => (
              <Tab
                key={category._id}
                label={category.name}
                value={category._id}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Menu Items */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {menuItems?.map((item) => (
            <Card
              key={item._id}
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardMedia
                component="div"
                sx={{
                  height: 140,
                  backgroundColor: "grey.200",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Typography color="textSecondary">No Image</Typography>
                )}
              </CardMedia>
              <CardContent
                sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="start"
                  mb={1}
                >
                  <Typography gutterBottom variant="h6" component="div">
                    {item.name}
                  </Typography>
                  <Chip
                    label={item.isVeg ? "Veg" : "Non-Veg"}
                    color={item.isVeg ? "success" : "error"}
                    size="small"
                  />
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ flexGrow: 1 }}
                >
                  {item.description}
                </Typography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                >
                  <Typography variant="h6" color="primary">
                    Rs{item.price}
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.isAvailable}
                  >
                    {item.isAvailable ? "Add" : "Unavailable"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 400, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Shopping Cart
          </Typography>
          <Divider />

          {cartItems.length === 0 ? (
            <Typography sx={{ mt: 2, textAlign: "center" }}>
              Your cart is empty
            </Typography>
          ) : (
            <>
              <List>
                {cartItems.map((item) => (
                  <ListItem key={item._id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={item.name}
                      secondary={`Rs${item.price} x ${item.quantity}`}
                    />
                    <Box display="flex" alignItems="center" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      >
                        <Remove />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeItem(item._id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>

              <Divider />

              <Box sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Subtotal:</Typography>
                  <Typography>Rs{getSubtotal().toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Tax (18%):</Typography>
                  <Typography>Rs{getTax().toFixed(2)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6">
                    Rs{getTotal().toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handlePlaceOrder}
                >
                  Place Order
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  sx={{ mt: 1 }}
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Order Details</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Order Type</InputLabel>
            <Select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as any)}
              label="Order Type"
            >
              <MuiMenuItem value="dine-in">Dine In</MuiMenuItem>
              <MuiMenuItem value="takeaway">Takeaway</MuiMenuItem>
              <MuiMenuItem value="delivery">Delivery</MuiMenuItem>
            </Select>
          </FormControl>

          {orderType === "dine-in" && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Table</InputLabel>
              <Select
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                label="Table"
              >
                {availableTables?.map((table) => (
                  <MuiMenuItem key={table._id} value={table._id}>
                    Table {table.number} (Capacity: {table.capacity})
                  </MuiMenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {orderType !== "dine-in" && (
            <>
              <TextField
                fullWidth
                margin="normal"
                label="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Person sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Phone Number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Phone sx={{ mr: 1, color: "action.active" }} />
                  ),
                }}
              />
            </>
          )}

          {orderType === "delivery" && (
            <TextField
              fullWidth
              margin="normal"
              label="Delivery Address"
              multiline
              rows={3}
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LocationOn
                    sx={{
                      mr: 1,
                      color: "action.active",
                      alignSelf: "start",
                      mt: 1,
                    }}
                  />
                ),
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmOrder}
            variant="contained"
            disabled={createOrderMutation.isPending}
          >
            {createOrderMutation.isPending ? "Creating..." : "Confirm Order"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POS;
