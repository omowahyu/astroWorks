import ProductFlex from "../components/ProductFlex";
import CleanVideoEmbed from "../components/VideoEmbed";
export default function Home() {
  return (
    <main className="py-4 lg:py-12">
      <div className="px-4 lg:px-6">
        <div className="w-full h-46 lg:h-[520px] rounded-3xl overflow-hidden">
        <CleanVideoEmbed videoId='dsTXcSeAZq8' />
        </div>
      </div>
      <div className="grid w-full gap-4 mt-10 lg:gap-20">
      <ProductFlex title="Kitchen" />
      <ProductFlex title="Wardrobe" />
      <ProductFlex title="Somethings" />
      </div>
    </main>
  );
}