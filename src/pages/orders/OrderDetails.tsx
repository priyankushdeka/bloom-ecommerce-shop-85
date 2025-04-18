
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ArrowLeft, CheckCircle, Package, Truck, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import * as orderService from "@/services/order.service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  if (!dateString) return "Not Available";
  
  try {
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  } catch (error) {
    return "Invalid date";
  }
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderById(id as string),
    enabled: !!id
  });
  
  // Handle error
  if (error) {
    toast({
      title: "Error",
      description: (error as Error).message || "Failed to fetch order details",
      variant: "destructive"
    });
  }

  const handleCancelOrder = async () => {
    if (!id) return;
    
    try {
      setIsCancelling(true);
      await orderService.cancelOrder(id, cancelReason);
      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel order",
        variant: "destructive"
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const order = data?.data?.order;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find the order you're looking for.</p>
            <Button asChild>
              <Link to="/orders">Back to Orders</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
        <div className="flex items-center mb-2">
          <Button variant="ghost" size="sm" asChild className="mr-2">
            <Link to="/orders">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Orders
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">Order #{order._id.substring(0, 8)}</h1>
              <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    Cancel Order
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Order</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this order? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <Label htmlFor="reason">Reason for cancellation</Label>
                    <Input
                      id="reason"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="Please specify the reason (optional)"
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Nevermind
                    </Button>
                    <Button variant="destructive" onClick={handleCancelOrder} disabled={isCancelling}>
                      {isCancelling ? "Cancelling..." : "Confirm Cancel"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Status */}
          <Card className="md:col-span-3">
            <CardHeader className="pb-4">
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Badge className={`px-3 py-1 text-sm ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
                
                {order.isPaid ? (
                  <div className="ml-4 flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span>Paid on {formatDate(order.paidAt)}</span>
                  </div>
                ) : (
                  <div className="ml-4 flex items-center text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    <span>Payment Pending</span>
                  </div>
                )}
                
                {order.isDelivered && (
                  <div className="ml-4 flex items-center text-green-600">
                    <Truck className="h-4 w-4 mr-1" />
                    <span>Delivered on {formatDate(order.deliveredAt)}</span>
                  </div>
                )}
              </div>
              
              {order.status === 'cancelled' && (
                <div className="mt-4 p-3 bg-red-50 rounded border border-red-200 text-red-700">
                  <p className="font-medium">Cancellation Reason:</p>
                  <p>{order.cancellationReason || "No reason provided"}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Order Items */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.orderItems.map((item: any) => (
                  <div key={item._id} className="flex items-center py-3 border-b last:border-0">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-gray-500 text-sm">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${order.itemsPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span>${order.shippingPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span>${order.taxPrice.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <p className="text-gray-600">{order.paymentMethod}</p>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <address className="text-gray-600 not-italic">
                  {order.shippingAddress.address}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}<br />
                  Phone: {order.shippingAddress.phone}
                </address>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
