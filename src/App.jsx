import React from "react";
import Header from "./components/Header";
import ProductFlex from "./components/ProductFlex";
import "./App.css";

export default function App() {
  return (
    <div className="flex h-screen">
      {/* <Sidebar /> */}
      <div className="flex-1 flex flex-col overflow-auto">
        <Header />
        <main className="p-4 space-y-12 max-w-5xl mx-auto">
          <div className=" w-full"></div>
          <ProductFlex title="Kitchen" />
          <ProductFlex title="Wardrobe" />
        </main>
      </div>
    </div>
  );
}
