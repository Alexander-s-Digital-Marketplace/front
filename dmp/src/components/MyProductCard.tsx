"use client";
import React, { useState } from "react";
import { Product } from "@/types/Product";
import {CORE_API_URL} from "@/config";
import axios from "axios";
import Cookies from "js-cookie";

interface MyProductCardProps {
  product: Product;
  onUpdate: () => Promise<void>;
}

const MyProductCard: React.FC<MyProductCardProps> = ({ product, onUpdate }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSell, setIsSell] = useState<boolean>(product.is_sell_now);

  const handleToggleSell = async () => {
    if (product.is_buy) return;

    try {
      setLoading(true);
      setError(null);

      const token = Cookies.get("token");

      if (!token) {
        setError("Необходима авторизация.");
        setLoading(false);
        return;
      }
      await axios.post(
        `${CORE_API_URL}/Protected/SwitchProduct`,
        { id: product.id, is_sell_now: isSell},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      await onUpdate();
    } catch (error) {
      console.error("Ошибка при изменении состояния товара:", error);
      setError("Не удалось обновить статус товара.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center rounded-lg shadow-md p-4 relative ${
        product.is_buy
          ? "bg-DeepTealBlue"
          : isSell
          ? "bg-PastelBlue"
          : "bg-GrayishBlue"
      }`}
    >
      <div className="flex flex-grow flex-col md:flex-row items-center">
        <img
          src={product.image}
          alt={product.title}
          className="w-24 h-24 object-cover rounded-lg mr-4"
        />

        <div className="flex-grow">
          <h3 className="text-DarkOceanBlue font-semibold">{product.title}</h3>
          <p className="text-DarkOceanBlue text-sm">{product.description}</p>
          <hr className="my-2 border-t border-DarkOceanBlue" />
          <p className="text-DarkOceanBlue text-sm">
            Цена:{" "}
            {Number(product.price.toFixed(9)).toLocaleString("en", {
              useGrouping: false,
              maximumFractionDigits: 9,
            })}{" "}
            ETH
          </p>
          <p className="text-DarkOceanBlue text-sm">
            Дата публикации: {product.pub_date.substring(0, 10)}
          </p>
        </div>

        <div className="mt-14 flex items-center space-x-4">
          <button
            onClick={handleToggleSell}
            className={`${
              product.is_buy
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-DarkSlateBlue hover:bg-DeepTealBlue"
            } text-white px-4 py-2 rounded focus:outline-none`}
            disabled={loading || product.is_buy}
          >
            {product.is_buy
              ? "ПРОДАНО"
              : loading
              ? "Обновление..."
              : isSell
              ? "Снять с продажи"
              : "Выставить на продажу"}
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default MyProductCard;
