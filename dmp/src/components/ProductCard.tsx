import React, { useState } from 'react';
import { Product } from '@/types/Product';
import axios from "axios";
import Cookies from "js-cookie";
import {CORE_API_URL} from "@/config";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const [addedToCart, setAddedToCart] = useState(false); // Состояние для отслеживания добавления в корзину

  const handleAddToCart = async (productId: number) => {
    try {
      const token = Cookies.get("token");
  
      if (!token) {
        console.error("Необходима авторизация.");
        return;
      }
  
      // Отправка запроса на сервер для добавления в корзину
      const response = await axios.post(
        `${CORE_API_URL}/Protected/AddProductToCart`,
        { product_id: productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        console.log("Товар успешно добавлен в корзину:", response.data);
        setAddedToCart(true); // Устанавливаем состояние, чтобы показать, что товар добавлен
      }
      if (response.status === 208) {
        console.log("Товар уже добавлен в корзину:", response.data);
        alert("Товар уже добавлен в корзину!");
        setAddedToCart(true); // Устанавливаем состояние, чтобы показать, что товар добавлен
      }
    } catch (error) {
      console.error("Ошибка при добавлении товара в корзину:", error);
    }
  };

  return (
    <div className="bg-PastelBlue rounded-lg shadow-md p-4 relative pb-16">
      {/* Изображение товара */}
      <img
        src={product.image} // Предполагаем, что product.image содержит ссылку на изображение из Cloudinary
        alt={product.title}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      
      <h3 className="text-DarkOceanBlue font-semibold mt-2">{product.title}</h3>
      <p className="text-DarkOceanBlue mt-1">{product.description}</p>
      <hr className="my-4 border-t border-DarkOceanBlue" />
      <p className="text-DarkOceanBlue mt-1 text-sm">
        Продавец: {product.Seller.user_name}
      </p>
      <p className="text-DarkOceanBlue mt-1 text-sm">
        ✦{Number(product.Seller.rating.toFixed(2)).toLocaleString("en", { 
          useGrouping: false, 
          maximumFractionDigits: 2
        })} • {product.Seller.count_rating} оценок
      </p>

      {/* Кнопка в левом нижнем углу */}
      <button
        className={`absolute left-4 bottom-4 text-GoldenYellow px-4 py-2 rounded bg-DarkSlateBlue hover:bg-DeepTealBlue ${addedToCart ? 'text-CharcoalGray bg-MintGreen hover:bg-EmeraldGreen' : ''}`}
        onClick={() => handleAddToCart(product.id)}
      >
        {addedToCart ? 'Добавленно в корзину' : `Купить: ${Number(product.price.toFixed(9)).toLocaleString("en", { 
          useGrouping: false, 
          maximumFractionDigits: 9 
        })} ETH`} {/* Меняем текст в зависимости от состояния */}
      </button>

      {/* Дата публикации в правом нижнем углу */}
      <p className="absolute right-4 bottom-4 text-gray-600 text-sm">
        Дата публикации: {product.pub_date.substring(0, 10)}
      </p>
      
      
    </div>
  );
};

export default ProductCard;
