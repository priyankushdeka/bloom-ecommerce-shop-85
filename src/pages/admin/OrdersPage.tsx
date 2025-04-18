
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Eye, Search, Package } from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import * as adminService from "@/services/admin.service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

const getStatusColor = (status: string) => {
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    shipped: "bg-purple-100 text-purple-800 border-purple-200",
    delivered: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200"
  };

  return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatDate = (dateString: string) => {
  try {
    return format(new Date(dateString), "MMM dd, yyyy");
  } catch (error) {
    return "Invalid date";
  }
};

const OrdersPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["adminOrders", currentPage],
    queryFn: () => adminService.getOrders(currentPage, 10),
    onSettled: (data, error: any) => {
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch orders",
          variant: "destructive"
        });
      }
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data: { id: string, status: string }) => 
      adminService.updateOrderStatus(data.id, data.status),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Order status updated successfully",
        variant: "default"
      });
      setIsStatusDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive"
      });
    }
  });

  const handleChangeStatus = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) return;
    
    updateStatusMutation.mutate({
      id: selectedOrder._id,
      status: newStatus
    });
  };

  const getValidStatusOptions = (currentStatus: string) => {
    const validStatusTransitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };

    return validStatusTransitions[currentStatus] || [];
  };

  const filteredOrders = data?.data?.orders.filter((order: any) => 
    order._id.includes(searchTerm) ||
    (order.user?.name && order.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (order.user?.email && order.user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            Orders Management
          </h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order ID, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order: any) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order._id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        {order.user?.name || "N/A"}
                        <br />
                        <span className="text-xs text-gray-500">{order.user?.email || "N/A"}</span>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.isPaid ? (
                          <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                            Not Paid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleChangeStatus(order)}
                            disabled={['delivered', 'cancelled'].includes(order.status)}
                          >
                            Update Status
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/orders/${order._id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Update Status Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Change the status for order #{selectedOrder?._id?.substring(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newStatus} 
                  onValueChange={setNewStatus}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={selectedOrder?.status}>
                      {selectedOrder?.status.charAt(0).toUpperCase() + selectedOrder?.status.slice(1)} (Current)
                    </SelectItem>
                    {getValidStatusOptions(selectedOrder?.status).map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateStatus} 
                disabled={updateStatusMutation.isPending || newStatus === selectedOrder?.status}
              >
                {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;
