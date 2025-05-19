"use client";

import { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Подключаем js-cookie
import {AUTH_API_URL} from '@/config';

const useJwtRefresher = () => {
  useEffect(() => {
    const refreshJwtToken = async () => {
      const refreshToken = localStorage.getItem("refreshToken"); // Достаем refresh токен из localStorage
      if (!refreshToken) {
        console.error("Refresh token not found");
        return;
      }

      try {
        const response = await axios.post(`${AUTH_API_URL}/RefreshToken`, {
          refresh_token: refreshToken,
        });
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        // Сохраняем токен в куки через js-cookie
        Cookies.set("token", newAccessToken, {
          expires: 7, // Время жизни куки — 7 дней
          sameSite: "Strict", // Защита куки
          secure: true, // Использовать только HTTPS
        });
        localStorage.setItem("refreshToken", newRefreshToken);

        console.log("Access token updated and stored in cookies:", newAccessToken);
        console.log("Refresh token updated and stored in localStorage:", newRefreshToken);


      } catch (error) {
        console.error("Failed to refresh JWT token", error);
        // Опционально: редирект на страницу логина
      }
    };

    const interval = setInterval(() => {
      refreshJwtToken();
    }, 20000); // Обновление каждые 20 секунд

    return () => {
      clearInterval(interval); // Очистка интервала при размонтировании компонента
    };
  }, []);
};

export default useJwtRefresher;
