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
} from "@mui/material";
import { Edit, Delete, Refresh } from "@mui/icons-material";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { menuService } from "../services/menuService";
import { Category } from "../types";
import { useAuth } from "../context/AuthContext";

const Categories: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    description: string;
  }>({ name: "", description: "" });
  const [tabValue, setTabValue] = useState("all");

  const { user } = useAuth();

  const { data: categories, refetch } = useQuery<Category[]>({
    queryKey: ["categories", tabValue],
    queryFn: async () => {
      const response = await menuService.getCategories();
      return response.data!;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: menuService.createCategory,
    onSuccess: () => {
      toast.success("Category created successfully");
      setCreateDialogOpen(false);
      setNewCategory({ name: "", description: "" });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: menuService.deleteCategory,
    onSuccess: () => {
      toast.success("Category deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete category");
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setEditDialogOpen(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id);
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
          Categories
        </Typography>
        {user?.role === "admin" || user?.role === "manager" ? (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateDialogOpen(true)}
              sx={{ mr: 2 }}
            >
              Add Category
            </Button>
            <IconButton onClick={() => refetch()} color="primary">
              <Refresh />
            </IconButton>
          </Box>
        ) : null}
      </Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Categories" value="all" />
          {/* You can add more tabs for filtering if needed */}
        </Tabs>
      </Paper>
      <Paper>
        <List>
          {categories?.map((category, index) => (
            <React.Fragment key={category._id}>
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
                      <Typography variant="h6">{category.name}</Typography>
                      <Chip
                        label={category.isActive ? "Active" : "Inactive"}
                        color={category.isActive ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {category.description}
                      </Typography>
                    </Box>
                  }
                />
                {(user?.role === "admin" || user?.role === "manager") && (
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </ListItem>
              {index < categories.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {!categories?.length && (
            <ListItem>
              <ListItemText
                primary="No categories found"
                secondary="Categories will appear here once added"
              />
            </ListItem>
          )}
        </List>
      </Paper>
      {/* Edit Category Dialog (structure only, not functional) */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          {selectedCategory && (
            <Box>
              <Typography>Name: {selectedCategory.name}</Typography>
              <Typography>
                Description: {selectedCategory.description}
              </Typography>
              <Typography>
                Status: {selectedCategory.isActive ? "Active" : "Inactive"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
      {/* Create Category Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            label="Category Name"
            value={newCategory.name}
            onChange={(e) =>
              setNewCategory({ ...newCategory, name: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={newCategory.description}
            onChange={(e) =>
              setNewCategory({ ...newCategory, description: e.target.value })
            }
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createCategoryMutation.mutate(newCategory)}
            disabled={createCategoryMutation.isPending}
          >
            {createCategoryMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Categories;
