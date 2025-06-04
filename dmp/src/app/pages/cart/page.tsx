"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Product } from "@/types/Product";
import CartProductCard from "@/components/CartProductCard";
import {CORE_API_URL} from "@/config";
import Cookies from "js-cookie";

const CartPage = () => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token");

      if (!token) {
        setError("Необходима авторизация.");
        setLoading(false);
        return;
      }


      const response = await axios.get(`${CORE_API_URL}/Protected/GetCart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Cart items:", response.data);

      setCartItems(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleRemoveFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const itemsToBuy = cartItems.filter((product) => !product.is_buy);
  const itemsBought = cartItems.filter((product) => product.is_buy);

  const updateCart = async () => {
    await fetchCartItems();
  };
  return (
    <div className="min-h-screen bg-LightIceBlue py-8">
      <h1 className="text-3xl font-bold text-center text-DarkAquamarine mb-8">
        Корзина
      </h1>

      {loading && (
        <p className="text-center text-DarkAquamarine">Загрузка товаров...</p>
      )}

      {error && <p className="text-center text-red-500">Ошибка: {error}</p>}

      {!loading && !error && (
        <>
          {itemsToBuy.length > 0 && (
            <div className="max-w-5xl mx-auto flex flex-col space-y-4 px-4">
              {itemsToBuy.map((product) => (
                <CartProductCard
                  key={product.id}
                  product={product}
                  onRemove={handleRemoveFromCart}
                  onUpdate={updateCart}
                />
              ))}
            </div>
          )}
          
          {itemsBought.length > 0 && (
            <>
              <div className="max-w-5xl mx-auto flex flex-col space-y-4 px-4">
                <hr className="mt-5 mb-1 border-t border-DarkOceanBlue w-full" />
                {itemsBought.map((product) => ( 
                  <CartProductCard
                    key={product.id}
                    product={product}
                    onRemove={handleRemoveFromCart}
                    onUpdate={updateCart}
                  />
                ))}
              </div>
            </>
          )}

          {itemsToBuy.length === 0 && itemsBought.length === 0 && (
            <p className="text-center text-gray-600">Ваша корзина пуста.</p>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;