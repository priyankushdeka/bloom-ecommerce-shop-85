
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  ratings: number;
  stock: number;
}

// INR conversion rate (assuming 1 USD = 75 INR)
const INR_CONVERSION_RATE = 75;

// Function to convert USD to INR
const convertToINR = (usdPrice: number) => {
  return usdPrice * INR_CONVERSION_RATE;
};

const ProductCard = ({ id, name, price, image, description, ratings, stock }: ProductCardProps) => {
  // Convert the price to INR
  const inrPrice = convertToINR(price);
  
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden relative">
        <Link to={`/products/${id}`}>
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          {stock <= 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Out of Stock
            </div>
          )}
          {stock > 0 && stock <= 5 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Low Stock
            </div>
          )}
        </Link>
      </div>

      <CardContent className="p-4 flex-grow">
        <Link to={`/products/${id}`} className="no-underline">
          <h3 className="font-semibold text-lg mb-1 text-gray-800 line-clamp-2">{name}</h3>
        </Link>
        <div className="flex items-center mb-2">
          <div className="flex items-center text-yellow-400">
            <span>★</span>
            <span className="ml-1 text-sm text-gray-600">{ratings.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{description}</p>
        <div className="text-lg font-bold text-blue-600 flex items-center">
          <span className="text-sm mr-1">₹</span>
          {inrPrice.toFixed(2)}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={stock <= 0}
        >
          <Link to={`/products/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
