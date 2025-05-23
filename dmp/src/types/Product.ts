// src/types/Product.ts

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  pub_date: string;
  is_buy: boolean;
  is_rated: boolean;
  is_sell_now: boolean;
  image: string;
  Seller: {
    id: number;
    user_name: string;
    rating: number;
    count_rating: number;
  },
}
