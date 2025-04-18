
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import LoadingSpinner from "@/components/ui/loading-spinner";
import * as orderService from "@/services/order.service";
import { CreditCard, Truck, MapPin } from "lucide-react";

const CheckoutPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  
  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: ""
  });
  
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  
  // Tax and shipping calculations
  const itemsPrice = cart?.totalPrice || 0;
  const taxRate = 0.05; // 5%
  const taxPrice = itemsPrice * taxRate;
  const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
  const totalPrice = itemsPrice + taxPrice + shippingPrice;
  
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => orderService.createOrder(orderData),
    onSuccess: (data) => {
      toast({
        title: "Order Created",
        description: "Your order has been placed successfully",
        variant: "default"
      });
      
      // Clear cart after successful order
      clearCart();
      
      // Redirect to order details page
      navigate(`/orders/${data.data.order._id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to place order",
        variant: "destructive"
      });
    }
  });
  
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || 
        !shippingAddress.country || !shippingAddress.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping details",
        variant: "destructive"
      });
      return;
    }
    
    if (!cart || !cart.items || cart.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty",
        variant: "destructive"
      });
      return;
    }
    
    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product,
      name: "Product", // This would ideally come from the product details
      quantity: item.quantity,
      image: "/placeholder.svg", // This would ideally come from the product details
      price: item.price
    }));
    
    // Create order
    createOrderMutation.mutate({
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice
    });
  };
  
  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }
  
  if (!user) {
    navigate("/login?redirect=checkout");
    return null;
  }
  
  if (!cart || !cart.items || cart.items.length === 0) {
    navigate("/cart");
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <CardTitle>Shipping Address</CardTitle>
                  <CardDescription>Enter your shipping details</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        value={shippingAddress.address}
                        onChange={handleShippingChange}
                        placeholder="Street address"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleShippingChange}
                        placeholder="City"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleShippingChange}
                        placeholder="Postal code"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleShippingChange}
                        placeholder="Country"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={handleShippingChange}
                      placeholder="Phone number for delivery"
                      required
                    />
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center">
                <CreditCard className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select how you want to pay</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay" className="flex-grow cursor-pointer">
                      Credit/Debit Card (Razorpay)
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 border rounded-md p-3">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-grow cursor-pointer">
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Items ({cart?.items.length})</h3>
                  <div className="space-y-3">
                    {cart?.items.map((item) => (
                      <div key={item._id} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.quantity} x Product
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (5%)</span>
                    <span>${taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {shippingPrice === 0 
                        ? <span className="text-green-600">Free</span> 
                        : `$${shippingPrice.toFixed(2)}`
                      }
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                
                {shippingPrice === 0 && (
                  <div className="bg-green-50 text-green-700 p-2 rounded text-sm flex items-center">
                    <Truck className="h-4 w-4 mr-1" />
                    Free shipping applied!
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleSubmit}
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
