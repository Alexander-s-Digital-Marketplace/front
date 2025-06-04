"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { CORE_API_URL } from "@/config";
import Cookies from "js-cookie";
import MyProductCard from "@/components/MyProductCard";
import { Product } from "@/types/Product";

interface User {
  user_name: string;
  rating: number;
  count_rating: number;
  wallet_id: number;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newWallet, setNewWallet] = useState<string>("");
  const [changeWalletMsg, setChangeWalletMsg] = useState<string | null>(null);

  const handleChangeWallet = async () => {
    setChangeWalletMsg(null);
    try {
      const token = Cookies.get("token");
      if (!token) {
        setChangeWalletMsg("Необходима авторизация.");
        return;
      }
      await axios.post(
        `${CORE_API_URL}/Protected/UpdateWallet`, 
        { wallet: newWallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChangeWalletMsg("Кошелек успешно обновлен!");
      fetchWallet();
      fetchBalance();
      setNewWallet("");
    } catch (err:any) {
      setChangeWalletMsg(
        err.response?.data?.message || "Ошибка при смене кошелька"
      );
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token");

      if (!token) {
        setError("Необходима авторизация.");
        setLoading(false);
        return;
      }

      const response = await axios.get(`${CORE_API_URL}/Protected/GetMyProfile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      setError(null);

      const token = Cookies.get("token");

      if (!token) {
        setError("Необходима авторизация.");
        return;
      }

      const response = await axios.get(`${CORE_API_URL}/Protected/GetWallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("wallet-data " + response.data)
      setWallet(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  };

  const fetchBalance = async () => {
    try {
      setError(null);

      const token = Cookies.get("token");

      if (!token) {
        setError("Необходима авторизация.");
        return;
      }

      const response = await axios.get(`${CORE_API_URL}/Protected/GetBalance`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("balance-data " + response.data)
      setBalance(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    }
  };

  const fetchMyProducts = async () => {
    try {
      const token = Cookies.get("token");

      if (!token) {
        setError("Необходима авторизация.");
        return;
      }

      const response = await axios.get(`${CORE_API_URL}/Protected/GetMyProduct`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMyProducts(response.data || []);
    } catch (err) {
      console.error("Ошибка загрузки товаров:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchWallet();
    fetchMyProducts();
    fetchBalance();
  }, []);

  const updateProducts = async () => {
    await fetchMyProducts();
  };

  const productsOnSale = myProducts.filter((product) => product.is_sell_now && !product.is_buy);
  const productsNotOnSale = myProducts.filter((product) => !product.is_sell_now && !product.is_buy);
  const productsSold = myProducts.filter((product) => product.is_buy);

  return (
    <div className="min-h-screen bg-LightIceBlue py-8">
      <h1 className="text-3xl font-bold text-center text-DarkAquamarine mb-8">
        Профиль
      </h1>

      {loading && (
        <p className="text-center text-DarkAquamarine">Загрузка данных...</p>
      )}
      {error && <p className="text-center text-red-500">Ошибка: {error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto px-4">
        <div>
          <h1 className="text-xl font-bold text-center text-DarkAquamarine mb-8">
            Обо мне
          </h1>
          {!loading && !error && user && (
            <div className="bg-PastelBlue rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-DarkOceanBlue mb-4">
                {user.user_name}
              </h2>
              <p className="text-DarkOceanBlue">
                <strong>Рейтинг:</strong> ✦{user.rating.toFixed(2)}
              </p>
              <p className="text-DarkOceanBlue">
                <strong>Количество оценок:</strong> {user.count_rating}
              </p>
              <p className="text-DarkOceanBlue">
                <strong>Кошелек:</strong>{" "}
                {wallet ? wallet : <>Загрузка...</>}
              </p>
              <p className="text-DarkOceanBlue">
                <strong>Балланс:</strong>{" "}
                {balance ? `${balance} ETH` : <>Загрузка...</>}
              </p>
            </div>
          )}
          {!loading && !error && !user && (
            <p className="text-center text-gray-600">
              Данные пользователя отсутствуют.
            </p>
          )}
          <div className="bg-PastelBlue rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-lg font-semibold text-DarkOceanBlue mb-4">
              Сменить кошелек
            </h2>
            <div className="mb-4">
              <label className="block text-DarkOceanBlue mb-2" htmlFor="change-wallet">
                Новый адрес кошелька:
              </label>
              <input
                id="change-wallet"
                type="text"
                className="bg-LightIceBlue w-full px-3 py-2 border border-DarkAquamarine rounded text-DarkAquamarine"
                value={newWallet}
                onChange={e => setNewWallet(e.target.value)}
                placeholder="0x..."
              />
            </div>
            <label className="block text-CrimsonBlaze text-sm italic text-justify mb-2" htmlFor="wallet">
                Пожалуйста, укажите действующий кошелек MetaMask, с которого будет производиться оплата товаров. В противном случае покупка не будет засчитана.
            </label>
            <button
              className="bg-DarkSlateBlue hover:bg-DeepTealBlue text-white px-4 py-2 rounded  transition"
              onClick={handleChangeWallet}
              disabled={!newWallet}
            >
              Сменить кошелек
            </button>
            {changeWalletMsg && (
              <p className="mt-2 text-center text-sm text-DarkOceanBlue">
                {changeWalletMsg}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-xl font-bold text-center text-DarkAquamarine mb-8">
            Мои товары
          </h1>

          {productsOnSale.map((product) => (
            <MyProductCard
              key={product.id}
              product={product}
              onUpdate={updateProducts}
            />
          ))}

          {productsNotOnSale.length > 0 && (
            <hr className="my-2 border-t border-DarkOceanBlue" />
          )}

          {productsNotOnSale.map((product) => (
            <MyProductCard
              key={product.id}
              product={product}
              onUpdate={updateProducts}
            />
          ))}

          {productsSold.length > 0 && (
            <hr className="my-2 border-t border-DarkOceanBlue" />
          )}

          {productsSold.map((product) => (
            <MyProductCard
              key={product.id}
              product={product}
              onUpdate={updateProducts}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;