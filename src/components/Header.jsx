export default function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">ASTRO-WORKS</h1>
      <div className="space-x-4 hidden md:flex">
        <button>Company</button>
        <button>Tutorial</button>
        <button>Chat</button>
        <button>Keranjang</button>
      </div>
    </header>
  );
}
