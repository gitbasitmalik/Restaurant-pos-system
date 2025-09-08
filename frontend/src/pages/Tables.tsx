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
import { orderservice } from "../services/orderService";
import { Table } from "../types";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const Tables: React.FC = () => {
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState("all");

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTable, setNewTable] = useState<{
    number: string;
    capacity: number;
    location: "indoor" | "outdoor" | "private";
  }>({ number: "", capacity: 2, location: "indoor" });

  const [editTableData, setEditTableData] = useState<Partial<Table>>({});

  const { data: tables, refetch } = useQuery<Table[]>({
    queryKey: ["tables", tabValue],
    queryFn: async () => {
      const response = await orderservice.getTables();
      return response.data!;
    },
  });

  const createTableMutation = useMutation({
    mutationFn: orderservice.createTable,
    onSuccess: () => {
      toast.success("Table created successfully");
      setCreateDialogOpen(false);
      setNewTable({ number: "", capacity: 2, location: "indoor" });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create table");
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: orderservice.deleteTable,
    onSuccess: () => {
      toast.success("Table deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete table");
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: ({
      id,
      tableData,
    }: {
      id: string;
      tableData: Partial<Table>;
    }) => orderservice.updateTable(id, tableData),
    onSuccess: () => {
      toast.success("Table updated successfully");
      setEditDialogOpen(false);
      setSelectedTable(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update table");
    },
  });

  const updateTableStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      orderservice.updateTableStatus(id, status),
    onSuccess: () => {
      toast.success("Table status updated successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to update table status"
      );
    },
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleEditTable = (table: Table) => {
    setSelectedTable(table);
    setEditTableData({
      number: table.number,
      capacity: table.capacity,
      location: table.location,
      status: table.status,
    });
    setEditDialogOpen(true);
  };

  const handleEditTableSave = () => {
    if (selectedTable && editTableData) {
      updateTableMutation.mutate({
        id: selectedTable._id,
        tableData: editTableData,
      });
    }
  };

  const handleDeleteTable = (id: string) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      deleteTableMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: string, status: string) => {
    updateTableStatusMutation.mutate({ id, status });
  };

  // Filter tables based on tabValue
  const filteredTables = tables?.filter((table) => {
    if (tabValue === "all") return true;
    return table.status === tabValue;
  });

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Tables
        </Typography>
        {user?.role === "admin" || user?.role === "manager" ? (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCreateDialogOpen(true)}
              sx={{ mr: 2 }}
            >
              Add Table
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
          <Tab label="All Tables" value="all" />
          <Tab label="Available" value="available" />
          <Tab label="Occupied" value="occupied" />
          <Tab label="Reserved" value="reserved" />
          <Tab label="Maintenance" value="maintenance" />
        </Tabs>
      </Paper>
      <Paper>
        <List>
          {filteredTables?.map((table, index) => (
            <React.Fragment key={table._id}>
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
                      <Typography variant="h6">Table {table.number}</Typography>
                      <Chip
                        label={table.status}
                        color={
                          table.status === "available"
                            ? "success"
                            : table.status === "occupied"
                            ? "warning"
                            : table.status === "reserved"
                            ? "info"
                            : "default"
                        }
                        size="small"
                      />
                      <Chip
                        label={table.location}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        Capacity: {table.capacity} • Created:{" "}
                        {new Date(table.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  }
                />
                {(user?.role === "admin" || user?.role === "manager") && (
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditTable(table)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteTable(table._id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </ListItem>
              {index < filteredTables.length - 1 && <Divider />}
            </React.Fragment>
          ))}
          {!filteredTables?.length && (
            <ListItem>
              <ListItemText
                primary="No tables found"
                secondary="Tables will appear here once added"
              />
            </ListItem>
          )}
        </List>
      </Paper>
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Table</DialogTitle>
        <DialogContent>
          {selectedTable && (
            <Box>
              <TextField
                label="Table Number"
                value={editTableData.number || ""}
                onChange={(e) =>
                  setEditTableData({ ...editTableData, number: e.target.value })
                }
                fullWidth
                margin="normal"
              />
              <TextField
                label="Capacity"
                type="number"
                value={editTableData.capacity || 2}
                onChange={(e) =>
                  setEditTableData({
                    ...editTableData,
                    capacity: Number(e.target.value),
                  })
                }
                fullWidth
                margin="normal"
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Location</InputLabel>
                <Select
                  value={editTableData.location || "indoor"}
                  onChange={(e) =>
                    setEditTableData({
                      ...editTableData,
                      location: e.target.value as
                        | "indoor"
                        | "outdoor"
                        | "private",
                    })
                  }
                  label="Location"
                >
                  <MenuItem value="indoor">Indoor</MenuItem>
                  <MenuItem value="outdoor">Outdoor</MenuItem>
                  <MenuItem value="private">Private</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editTableData.status || "available"}
                  onChange={(e) =>
                    setEditTableData({
                      ...editTableData,
                      status: e.target.value as
                        | "available"
                        | "occupied"
                        | "reserved"
                        | "maintenance",
                    })
                  }
                  label="Status"
                >
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="occupied">Occupied</MenuItem>
                  <MenuItem value="reserved">Reserved</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditTableSave}
            disabled={updateTableMutation.isPending}
          >
            {updateTableMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      >
        <DialogTitle>Add New Table</DialogTitle>
        <DialogContent>
          <TextField
            label="Table Number"
            value={newTable.number}
            onChange={(e) =>
              setNewTable({ ...newTable, number: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <TextField
            label="Capacity"
            type="number"
            value={newTable.capacity}
            onChange={(e) =>
              setNewTable({ ...newTable, capacity: Number(e.target.value) })
            }
            fullWidth
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Location</InputLabel>
            <Select
              value={newTable.location}
              onChange={(e) =>
                setNewTable({
                  ...newTable,
                  location: e.target.value as "indoor" | "outdoor" | "private",
                })
              }
              label="Location"
            >
              <MenuItem value="indoor">Indoor</MenuItem>
              <MenuItem value="outdoor">Outdoor</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => createTableMutation.mutate(newTable)}
            disabled={createTableMutation.isPending}
          >
            {createTableMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tables;
