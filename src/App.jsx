import React from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import "./App.css";

import Home from "./pages/Home";
import Product from "./pages/Product";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";

export default function App() {
  return (
    <div className="bg-[#5F44F0]">
      <Header />
      <div className=" bg-white rounded-t-4xl lg:rounded-none min-h-screen">
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="/product" element={<Product />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}
