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
  Divider,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Refresh } from "@mui/icons-material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { menuService } from "../services/menuService";
import { useAuth } from "../context/AuthContext";
import { MenuItem as MenuItemType, Category } from "../types";

const MenuItems: React.FC = () => {
  const { user } = useAuth();
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemType | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState("all");
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItemType>>({
    name: "",
    description: "",
    price: 0,
    category: undefined,
    isVeg: true,
    isAvailable: true,
    preparationTime: 10,
    rating: 0,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await menuService.getCategories();
      return response.data!;
    },
  });

  const { data: menuItems, refetch } = useQuery<MenuItemType[]>({
    queryKey: ["menuItems", tabValue],
    queryFn: async () => {
      const params = tabValue !== "all" ? { category: tabValue } : {};
      const response = await menuService.getMenuItems(params);
      return response.data!;
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: menuService.createMenuItem,
    onSuccess: () => {
      toast.success("Menu item created successfully");
      setCreateDialogOpen(false);
      setNewMenuItem({
        name: "",
        description: "",
        price: 0,
        category: undefined,
        isVeg: true,
        isAvailable: true,
        preparationTime: 10,
        rating: 0,
      });
      refetch();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create menu item"
      );
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MenuItemType> }) =>
      menuService.updateMenuItem(id, data),
    onSuccess: () => {
      toast.success("Menu item updated successfully");
      setEditDialogOpen(false);
      setSelectedMenuItem(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update menu item"
      );
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: menuService.deleteMenuItem,
    onSuccess: () => {
      toast.success("Menu item deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete menu item"
      );
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleEditMenuItem = (item: MenuItemType) => {
    setSelectedMenuItem(item);
    setEditDialogOpen(true);
  };

  const handleDeleteMenuItem = (id: string) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(id);
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
          Menu Items
        </Typography>
        {(user?.role === "admin" || user?.role === "manager") && (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateDialogOpen(true)}
              sx={{ mr: 2 }}
            >
              Add Menu Item
            </Button>
            <IconButton onClick={() => refetch()} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        )}
      </Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
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
      <Paper>
        <List>
          {menuItems?.map((item, index) => (
            <React.Fragment key={item._id}>
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
                      <Typography variant="h6">{item.name}</Typography>
                      <Chip
                        label={item.isVeg ? "Veg" : "Non-Veg"}
                        color={item.isVeg ? "success" : "error"}
                        size="small"
                      />
                      <Chip
                        label={item.isAvailable ? "Available" : "Unavailable"}
                        color={item.isAvailable ? "success" : "default"}
                        size="small"
                      />
                      <Chip
                        label={item.category?.name}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Rs{item.price} • Prep: {item.preparationTime} min •
                        Rating: {item.rating}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.description}
                      </Typography>
                    </Box>
                  }
                />
                {(user?.role === "admin" || user?.role === "manager") && (
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditMenuItem(item)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteMenuItem(item._id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </ListItem>
              {index < menuItems.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {!menuItems?.length && (
            <ListItem>
              <ListItemText
                primary="No menu items found"
                secondary="Menu items will appear here once added"
              />
            </ListItem>
          )}
        </List>
      </Paper>
      {/* Create Menu Item Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <DialogTitle>Add New Menu Item</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={newMenuItem.name}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, name: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={newMenuItem.description}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, description: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            type="number"
            value={newMenuItem.price}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, price: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              value={newMenuItem.category?._id || ""}
              onChange={(e) => {
                const cat = categories?.find((c) => c._id === e.target.value);
                setNewMenuItem({ ...newMenuItem, category: cat });
              }}
              label="Category"
            >
              {categories?.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={newMenuItem.isVeg ? "veg" : "non-veg"}
              onChange={(e) =>
                setNewMenuItem({
                  ...newMenuItem,
                  isVeg: e.target.value === "veg",
                })
              }
              label="Type"
            >
              <MenuItem value="veg">Veg</MenuItem>
              <MenuItem value="non-veg">Non-Veg</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Availability</InputLabel>
            <Select
              value={newMenuItem.isAvailable ? "available" : "unavailable"}
              onChange={(e) =>
                setNewMenuItem({
                  ...newMenuItem,
                  isAvailable: e.target.value === "available",
                })
              }
              label="Availability"
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="unavailable">Unavailable</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Preparation Time (min)"
            type="number"
            value={newMenuItem.preparationTime}
            onChange={(e) =>
              setNewMenuItem({
                ...newMenuItem,
                preparationTime: Number(e.target.value),
              })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Rating"
            type="number"
            value={newMenuItem.rating}
            onChange={(e) =>
              setNewMenuItem({ ...newMenuItem, rating: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createMenuItemMutation.mutate(newMenuItem)}
            disabled={createMenuItemMutation.isPending}
          >
            {createMenuItemMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Menu Item Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Menu Item</DialogTitle>
        <DialogContent>
          {selectedMenuItem && (
            <>
              <TextField
                label="Name"
                value={selectedMenuItem.name}
                onChange={(e) =>
                  setSelectedMenuItem({
                    ...selectedMenuItem,
                    name: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Description"
                value={selectedMenuItem.description}
                onChange={(e) =>
                  setSelectedMenuItem({
                    ...selectedMenuItem,
                    description: e.target.value,
                  })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Price"
                type="number"
                value={selectedMenuItem.price}
                onChange={(e) =>
                  setSelectedMenuItem({
                    ...selectedMenuItem,
                    price: Number(e.target.value),
                  })
                }
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedMenuItem.category?._id || ""}
                  onChange={(e) => {
                    const cat = categories?.find(
                      (c) => c._id === e.target.value
                    );
                    setSelectedMenuItem({
                      ...selectedMenuItem,
                      category: cat!,
                    });
                  }}
                  label="Category"
                >
                  {categories?.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                  value={selectedMenuItem.isVeg ? "veg" : "non-veg"}
                  onChange={(e) =>
                    setSelectedMenuItem({
                      ...selectedMenuItem,
                      isVeg: e.target.value === "veg",
                    })
                  }
                  label="Type"
                >
                  <MenuItem value="veg">Veg</MenuItem>
                  <MenuItem value="non-veg">Non-Veg</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Availability</InputLabel>
                <Select
                  value={
                    selectedMenuItem.isAvailable ? "available" : "unavailable"
                  }
                  onChange={(e) =>
                    setSelectedMenuItem({
                      ...selectedMenuItem,
                      isAvailable: e.target.value === "available",
                    })
                  }
                  label="Availability"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Preparation Time (min)"
                type="number"
                value={selectedMenuItem.preparationTime}
                onChange={(e) =>
                  setSelectedMenuItem({
                    ...selectedMenuItem,
                    preparationTime: Number(e.target.value),
                  })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Rating"
                type="number"
                value={selectedMenuItem.rating}
                onChange={(e) =>
                  setSelectedMenuItem({
                    ...selectedMenuItem,
                    rating: Number(e.target.value),
                  })
                }
                fullWidth
                margin="normal"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() =>
              selectedMenuItem &&
              updateMenuItemMutation.mutate({
                id: selectedMenuItem._id,
                data: selectedMenuItem,
              })
            }
            disabled={updateMenuItemMutation.isPending}
          >
            {updateMenuItemMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuItems;
