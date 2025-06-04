"use client";

import { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import {AUTH_API_URL} from '@/config';

const useJwtRefresher = () => {
  useEffect(() => {
    const refreshJwtToken = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
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

        Cookies.set("token", newAccessToken, {
          expires: 7,
          sameSite: "Strict",
          secure: true,
        });
        localStorage.setItem("refreshToken", newRefreshToken);

        console.log("Access token updated and stored in cookies:", newAccessToken);
        console.log("Refresh token updated and stored in localStorage:", newRefreshToken);


      } catch (error) {
        console.error("Failed to refresh JWT token", error);
      }
    };

    const interval = setInterval(() => {
      refreshJwtToken();
    }, 20000);

    return () => {
      clearInterval(interval);
    };
  }, []);
};

export default useJwtRefresher;
