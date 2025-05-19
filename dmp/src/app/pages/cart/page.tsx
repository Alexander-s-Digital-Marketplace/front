"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Product } from "@/types/Product"; // Предполагаем, что тип Product уже определен в проекте
import CartProductCard from "@/components/CartProductCard"; // Импортируем новую карточку для корзины
import {CORE_API_URL} from "@/config";
import Cookies from "js-cookie";

const CartPage = () => {
  const [cartItems, setCartItems] = useState<Product[]>([]); // Состояние для хранения товаров в корзине
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для получения товаров из корзины через GET-запрос
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Получаем токен из cookies
      const token = Cookies.get("token");

      if (!token) {
        setError("Необходима авторизация.");
        setLoading(false);
        return;
      }

      // Отправка GET-запроса для получения товаров из корзины
      const response = await axios.get(`${CORE_API_URL}/Protected/GetCart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Cart items:", response.data);
      // Устанавливаем товары в состояние
      setCartItems(response.data || []); // Защищаем от null/undefined
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
    // Логика для удаления товара из корзины
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    // Здесь также можно отправить запрос на сервер для обновления корзины
  };

  const itemsToBuy = cartItems.filter((product) => !product.is_buy);
  const itemsBought = cartItems.filter((product) => product.is_buy);

  const updateCart = async () => {
    await fetchCartItems(); // Повторное получение товаров
  };
  return (
    <div className="min-h-screen bg-LightIceBlue py-8">
      <h1 className="text-3xl font-bold text-center text-DarkAquamarine mb-8">
        Корзина
      </h1>

      {/* Статус загрузки */}
      {loading && (
        <p className="text-center text-DarkAquamarine">Загрузка товаров...</p>
      )}

      {/* Ошибка при загрузке */}
      {error && <p className="text-center text-red-500">Ошибка: {error}</p>}

      {/* Отображение товаров в корзине */}
      {!loading && !error && (
        <>
          {itemsToBuy.length > 0 && (
            <div className="max-w-5xl mx-auto flex flex-col space-y-4 px-4">
              {itemsToBuy.map((product) => (
                <CartProductCard
                  key={product.id}
                  product={product}
                  onRemove={handleRemoveFromCart} // Передаем функцию удаления
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
                    onRemove={handleRemoveFromCart} // Передаем функцию удаления
                    onUpdate={updateCart}
                  />
                ))}
              </div>
            </>
          )}

          {/* Если корзина пуста */}
          {itemsToBuy.length === 0 && itemsBought.length === 0 && (
            <p className="text-center text-gray-600">Ваша корзина пуста.</p>
          )}
        </>
      )}
    </div>
  );
};

export default CartPage;