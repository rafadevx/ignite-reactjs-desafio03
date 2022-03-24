import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const newCart = [...cart];
      const productIndex = cart.findIndex(item => item.id === productId);
      const stock = await api.get(`stock/${productId}`);
      if(stock.data.amount === 0) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      if (productIndex >= 0) {
        if(newCart[productIndex].amount >= stock.data.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }
        newCart[productIndex].amount += 1;
      } else {
        const response = await api.get(`products/${productId}`);
        newCart.push({...response.data, amount: 1});
      }
      setCart(newCart);
      localStorage.setItem('@RocketShoes:cart' ,JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
      const productIndex = cart.findIndex(item => item.id === productId);
      if (productIndex < 0) {
        toast.error('Erro na remoção do produto');
        return;
      }
        const newCart = [...cart];
        newCart.splice(productIndex, 1);
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart' ,JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      if (amount <= 0) {
        return;
      }
      const stock = await api.get(`stock/${productId}`);
      if(stock.data.amount === 0) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }
      const productIndex = cart.findIndex(item => item.id === productId);
      if (productIndex < 0) {
        toast.error('Erro na alteração de quantidade do produto');
        return;
      }
        const newCart = [...cart];
        if(amount >= stock.data.amount) {
          toast.error('Quantidade solicitada fora de estoque');
          return;
        }
        newCart[productIndex].amount = amount;
        setCart(newCart);
        localStorage.setItem('@RocketShoes:cart',JSON.stringify(newCart));
    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
