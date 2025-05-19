"use client";

import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from 'next/navigation';
import { AUTH_API_URL }from "@/config";

const AuthPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailLogin, setEmailLogin] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${AUTH_API_URL}/Login`, 
        { email: emailLogin, password: password });
      const token = response.data.accessToken;
      console.log('JWT Token:', token);

      const refreshToken = response.data.refreshToken;
      console.log('refreshToken:', refreshToken);

      Cookies.set('token', token, { expires: 7, sameSite: 'Strict' });
      localStorage.setItem("refreshToken", refreshToken);

      router.push('/pages/feed');
    } catch (error) {
      console.error('Ошибка авторизации:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    
    const requestData = { user_name: name, email: email, password: registerPassword };
    console.log("Отправляемый JSON:", JSON.stringify(requestData));
  
    try {
      await axios.post(`${AUTH_API_URL}/Register`, requestData);
      alert("Регистрация успешна! Теперь вы можете войти.");
    } catch (error) {
      console.error('Ошибка регистрации:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-LightIceBlue">
      <div className="flex w-full max-w-4xl space-x-8">
        {/* Карточка регистрации */}
        <div className="w-1/2 bg-PastelBlue shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <h2 className="text-DarkOceanBlue text-2xl font-bold mb-4 text-center">Регистрация</h2>
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-DarkOceanBlue text-sm font-bold mb-2" htmlFor="name">
                Имя
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-LightIceBlue shadow appearance-none rounded w-full py-2 px-3 text-DarkAquamarine leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Введите имя"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-DarkOceanBlue text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-LightIceBlue shadow appearance-none rounded w-full py-2 px-3 text-DarkAquamarine leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Введите email"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-DarkOceanBlue text-sm font-bold mb-2" htmlFor="registerPassword">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? "text" : "password"}
                  id="registerPassword"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="bg-LightIceBlue shadow appearance-none rounded w-full py-2 px-3 text-DarkAquamarine leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Введите пароль"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-xl leading-5 text-DarkOceanBlue"
                >
                  {showRegisterPassword ? "☆" : "★"}
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-DarkOceanBlue text-sm font-bold mb-2" htmlFor="confirmPassword">
                Подтвердите пароль
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-LightIceBlue shadow appearance-none rounded w-full py-2 px-3 text-DarkAquamarine leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Подтвердите пароль"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-xl leading-5 text-DarkOceanBlue"
                >
                  {showConfirmPassword ? "☆" : "★"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-DarkSlateBlue hover:bg-DeepTealBlue text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                
              >
                Зарегистрироваться
              </button>
            </div>
          </form>
        </div>

        {/* Карточка авторизации */}
        <div className="w-1/2 bg-PastelBlue shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col justify-center">
          <h2 className="text-DarkOceanBlue text-2xl font-bold mb-4 text-center">Вход</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-DarkOceanBlue text-sm font-bold mb-2" htmlFor="username">
                Логин
              </label>
              <input
                type="text"
                id="username"
                value={emailLogin}
                onChange={(e) => setEmailLogin(e.target.value)}
                className="bg-LightIceBlue shadow appearance-none rounded w-full py-2 px-3 text-DarkAquamarine leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Введите логин"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-DarkOceanBlue text-sm font-bold mb-2" htmlFor="password">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-LightIceBlue shadow appearance-none rounded w-full py-2 px-3 text-DarkAquamarine leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Введите пароль"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-xl leading-5 text-DarkOceanBlue"
                >
                  {showPassword ? "☆" : "★"}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-DarkSlateBlue hover:bg-DeepTealBlue text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Войти
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;