import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCart } from "@/contexts/CartContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CartSheet = ({ open, onOpenChange }: CartSheetProps) => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-6">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-heading text-2xl flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({cartCount})
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-muted-foreground space-y-4">
            <ShoppingBag className="w-16 h-16 opacity-20" />
            <p className="font-body text-lg">Your cart is empty</p>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-4">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-grow -mx-6 px-6">
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    {/* Item Image */}
                    <div className="w-20 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex flex-col flex-grow justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="font-body font-medium text-sm text-foreground line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 text-transform: uppercase">
                            {item.size} / {item.condition}/10
                          </p>
                        </div>
                        <p className="font-heading font-semibold text-sm">
                          ₹{item.price}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Adjuster */}
                        <div className="flex items-center border border-border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-body text-xs font-medium px-2 min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors p-2 -mr-2 opacity-0 group-hover:opacity-100"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="pt-6 mt-auto">
              <Separator className="mb-4" />
              <div className="space-y-1.5 mb-6">
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{cartTotal}</span>
                </div>
                <div className="flex justify-between font-body text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="flex justify-between font-heading font-bold text-lg text-foreground mt-2 pt-2 border-t border-border">
                  <span>Total</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>

              <SheetFooter>
                <Button className="w-full font-bold bg-[#FFD166] text-black hover:bg-[#FFD166]/90 py-6">
                  Proceed to Checkout
                </Button>
              </SheetFooter>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
