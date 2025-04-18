import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Search, Trash, Package, Upload } from "lucide-react";
import AdminLayout from "./components/AdminLayout";
import LoadingSpinner from "@/components/ui/loading-spinner";
import * as productService from "@/services/product.service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  stock: string;
}

const ProductsPage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productData, setProductData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: ""
  });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", currentPage],
    queryFn: () => productService.getAllProducts({ page: currentPage, limit: 10 })
  });
  
  if (error) {
    toast({
      title: "Error",
      description: (error as Error).message || "Failed to fetch products",
      variant: "destructive"
    });
  }

  const createMutation = useMutation({
    mutationFn: (productData: FormData | any) => productService.createProduct(productData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to create product",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, productData: FormData | any }) => 
      productService.updateProduct(data.id, data.productData),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product updated successfully",
        variant: "default"
      });
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
    },
    onError: (error: any) => {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message || "Failed to update product",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully",
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setProductData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: ""
    });
    setSelectedProduct(null);
    setSelectedFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateMode(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: any) => {
    setSelectedProduct(product);
    setProductData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString()
    });
    setIsCreateMode(false);
    setIsDialogOpen(true);
  };

  const validateForm = () => {
    if (!productData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (!productData.description?.trim()) {
      toast({
        title: "Validation Error",
        description: "Product description is required (min 10 characters)",
        variant: "destructive"
      });
      return false;
    }
    
    if (!productData.description || productData.description.length < 10) {
      toast({
        title: "Validation Error",
        description: "Description must be at least 10 characters",
        variant: "destructive"
      });
      return false;
    }

    if (!productData.price || isNaN(Number(productData.price)) || Number(productData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be a positive number",
        variant: "destructive"
      });
      return false;
    }

    if (!productData.category?.trim()) {
      toast({
        title: "Validation Error",
        description: "Category is required",
        variant: "destructive"
      });
      return false;
    }

    if (!productData.stock || isNaN(Number(productData.stock)) || Number(productData.stock) < 0) {
      toast({
        title: "Validation Error",
        description: "Stock must be a positive number or zero",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    try {
      if (selectedFiles && selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append("name", productData.name);
        formData.append("description", productData.description);
        formData.append("price", productData.price);
        formData.append("category", productData.category);
        formData.append("stock", productData.stock);
        
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append("images", selectedFiles[i]);
        }
        
        if (isCreateMode) {
          console.log("Submitting form data:", Object.fromEntries(formData));
          createMutation.mutate(formData);
        } else if (selectedProduct) {
          updateMutation.mutate({
            id: selectedProduct._id,
            productData: formData
          });
        }
      } else {
        const jsonData = {
          name: productData.name,
          description: productData.description,
          price: Number(productData.price),
          category: productData.category,
          stock: Number(productData.stock)
        };
        
        console.log("Submitting JSON data:", jsonData);
        
        if (isCreateMode) {
          createMutation.mutate(jsonData);
        } else if (selectedProduct) {
          updateMutation.mutate({
            id: selectedProduct._id,
            productData: jsonData
          });
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "There was an error submitting the form",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(e.target.files);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProducts = data?.data?.products.filter((product: any) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
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
            Products Management
          </h1>
          
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, description or category..."
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
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: any) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="h-12 w-12 overflow-hidden rounded border">
                          <img
                            src={product.images?.[0] || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-700' 
                            : product.stock > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock > 0 ? product.stock : 'Out of stock'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700" 
                            onClick={() => handleDeleteProduct(product._id)}
                          >
                            <Trash className="h-4 w-4" />
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
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {isCreateMode ? "Add New Product" : "Edit Product"}
              </DialogTitle>
              <DialogDescription>
                {isCreateMode
                  ? "Fill in the details to create a new product"
                  : "Update the product information"
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description * (min 10 chars)</Label>
                <Textarea
                  id="description"
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  placeholder="Enter product description (min 10 characters)"
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={productData.stock}
                    onChange={(e) => setProductData({ ...productData, stock: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={productData.category}
                  onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                  placeholder="Enter product category"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="images">Product Images</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Input
                    id="images"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 flex flex-col items-center justify-center"
                  >
                    <Upload className="h-6 w-6 mb-2" />
                    <span>Click to upload images</span>
                    <span className="text-xs text-gray-500 mt-1">
                      {selectedFiles?.length 
                        ? `${selectedFiles.length} file(s) selected` 
                        : "JPG, PNG or WebP (max 5MB each)"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isCreateMode ? "Create Product" : "Update Product"
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ProductsPage;
