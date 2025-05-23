import React, { useState } from 'react';
import { Product } from '@/types/Product';
import axios from "axios";
import Cookies from "js-cookie";
import { CORE_API_URL } from "@/config";
import { ethers } from "ethers";
import contractAbi from "../contract_config/PayRouter.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface PayParams {
  contract_address: string;
  order_id: number | string;
  seller_address: string;
  price_wei: string;
}

interface CartProductCardProps {
  product: Product;
  onRemove: (productId: number) => void;
  onUpdate: () => Promise<void>;
}

const CartProductCard: React.FC<CartProductCardProps> = ({
  product,
  onRemove,
  onUpdate,
}) => {
  const [isPaid, setIsPaid] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояния для рейтинга
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingHover, setRatingHover] = useState<number | null>(null);

  const handleRemove = async () => {
    setError(null);
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Необходима авторизация.");
        return;
      }
      await axios.post(
        `${CORE_API_URL}/Protected/RemoveProductFromCart`,
        { product_id: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRemove(product.id);
    } catch (err) {
      setError("Не удалось удалить товар из корзины.");
    }
  };

  async function payOnChain(payParams: PayParams): Promise<boolean> {
    const { contract_address, order_id, seller_address, price_wei } = payParams;
    if (!window.ethereum) {
      setError("Пожалуйста, установите MetaMask!");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contract_address, contractAbi.abi, signer);
      await provider.send("eth_requestAccounts", []);
      const tx = await contract.payForProduct(
        order_id, seller_address, { value: price_wei }
      );
      await tx.wait();
      alert("Товар оплачен, транзакция hash: " + tx.hash);
      return true;
    } catch (e: any) {
      setError("Ошибка оплаты: " + (e?.message || "Неизвестная ошибка"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Необходима авторизация.");
        setIsLoading(false);
        return;
      }
      const response = await axios.post(
        `${CORE_API_URL}/Protected/BuyProduct`,
        { id: product.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 && response.data) {
        const priceEth = response.data.Price ?? response.data.price;
        if (!priceEth && priceEth !== 0) {
          setError("Ошибка: поле Price отсутствует в ответе сервера");
          return;
        }
        const priceStr = priceEth.toFixed(18).replace(/\.?0+$/, '');
        const price_wei = ethers.parseEther(priceStr).toString();
        const payParams: PayParams = {
          contract_address: response.data.Address,
          order_id: response.data.OrderId,
          seller_address: response.data.SellerAddress,
          price_wei,
        };
        const payRes = await payOnChain(payParams);
        if (payRes) setIsPaid(true);
      } else {
        setError("Не удалось получить параметры для оплаты.");
      }
      onUpdate();
    } catch (error: any) {
      setError("Ошибка при оплате товара: " + (error?.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelivery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = Cookies.get("token");
      if (!token) {
        setError("Необходима авторизация.");
        setIsLoading(false);
        return;
      }
      await axios.get(
        `${CORE_API_URL}/Protected/DeliverProduct?product_id=${product.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setError("Ошибка неудалось доставить товар.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateProduct = async (rateValue: number) => {
    setIsRatingLoading(true);
    setRatingError(null);

    const token = Cookies.get("token");
    if (!token) {
      setRatingError("Необходима авторизация.");
      setIsRatingLoading(false);
      return;
    }

    try {
      await axios.post(
        `${CORE_API_URL}/Protected/RateProduct`,
        {
          product_id: product.id,
          rate: rateValue
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await onUpdate();
    } catch (err: any) {
      setRatingError("Ошибка при оценке товара");
    } finally {
      setIsRatingLoading(false);
    }
  };

  const handleSelection = () => setIsSelected((prev) => !prev);

  const cardClass = [
    "flex items-center rounded-lg shadow-md p-4 relative",
    isSelected ? "border-2 border-GoldenYellow" : "",
    product.is_buy ? "bg-GrayishBlue" : "bg-PastelBlue"
  ].join(" ");

  // Звездочки ПОД карточкой
  const renderRating = () => {
    if(!(product.is_buy && !product.is_rated)) return null;
    const stars = Array.from({ length: 10 }, (_, idx) => idx + 1);

    return (
      <div
        className="flex items-center justify-center mt-4"
        style={{
          userSelect: "none"
        }}
      >
        {stars.map(val => (
          <span
            key={val}
            onClick={() => !isRatingLoading && handleRateProduct(val)}
            onMouseEnter={() => setRatingHover(val)}
            onMouseLeave={() => setRatingHover(null)}
            style={{
              fontSize: "2rem",
              color: "#ffb300",
              cursor: isRatingLoading ? "default" : "pointer",
              transition: "color 0.2s"
            }}
          >
            {ratingHover !== null
              ? (val <= ratingHover ? "✦" : "✧")
              : "✧"
            }
          </span>
        ))}
        {isRatingLoading &&
          <span className="ml-4 text-gray-600 text-xs">Сохраняем...</span>
        }
        {ratingError &&
          <span className="ml-4 text-red-500 text-xs">{ratingError}</span>
        }
      </div>
    );
  };

  return (
    <>
      <div className={cardClass}>
        {!product.is_buy && (
          <button onClick={handleRemove}
            className="absolute top-2 right-2 text-red-500 hover:text-red-600"
            disabled={isLoading}
          >
            🗑️
          </button>
        )}

        <div className="flex flex-grow flex-col md:flex-row items-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-24 h-24 object-cover rounded-lg mr-4"
          />
          <div className="flex-grow">
            <h3 className="text-DarkOceanBlue font-semibold">
              {product.is_buy ? "[ОПЛАЧЕНО] " + product.title : product.title}
            </h3>
            <p className="text-DarkOceanBlue text-sm">{product.description}</p>
            <hr className="my-2 border-t border-DarkOceanBlue w-1/2" />
            <p className="text-DarkOceanBlue text-sm">
              Продавец: {product.Seller.user_name}
            </p>
            <p className="text-DarkOceanBlue text-sm">
              ✦{Number(product.Seller.rating.toFixed(2)).toLocaleString("en", { 
                useGrouping: false, 
                maximumFractionDigits: 2
              })} • {product.Seller.count_rating} оценок
            </p>
          </div>
          <div className="flex flex-col items-end">
            <button
              className={
                "mt-10 px-4 py-2 rounded text-white " +
                (product.is_buy ? "bg-DarkSlateBlue hover:bg-DeepTealBlue" : "bg-DarkSlateBlue hover:bg-DeepTealBlue")
              }
              onClick={product.is_buy ? handleDelivery : handlePayment}
              disabled={isLoading}
            >
              {isLoading
                ? "Выполняется..."
                : product.is_buy
                  ? "Доставить"
                  : `Оплатить: ${Number(product.price.toFixed(9)).toLocaleString("en", {
                      useGrouping: false,
                      maximumFractionDigits: 9,
                    })} ETH`}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      {renderRating()}
    </>
  );
};

export default CartProductCard;