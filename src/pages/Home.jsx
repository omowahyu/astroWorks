import ProductFlex from "../components/ProductFlex";

export default function Home() {
  return (
    <main className="py-12">
      <div className="px-4 lg:px-6">
        <div className="w-full h-46 lg:h-[520px] rounded-2xl overflow-hidden">
          <img
            src={`https://placehold.co/600x520`}
            alt="video"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="grid w-full gap-4 lg:gap-20 py-12">
      <ProductFlex title="Kitchen" />
      <ProductFlex title="Wardrobe" />
      <ProductFlex title="Somethings" />
      </div>
    </main>
  );
}