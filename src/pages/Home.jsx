import ProductFlex from "../components/ProductFlex";

export default function Home() {
  return (
    <main className="py-12">
      <div className="grid w-full lg:gap-20">
      <ProductFlex title="Kitchen" />
      <ProductFlex title="Wardrobe" />
      <ProductFlex title="Somethings" />
      </div>
    </main>
  );
}