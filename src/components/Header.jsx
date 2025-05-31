import logo from "../assets/logo.svg";
import iCompany from "../assets/nav/icompany.svg";
import iTutorial from "../assets/nav/itutorial.svg";
import iChat from "../assets/nav/ichat.svg";
import iCart from "../assets/nav/icart.svg";

import { Link } from "react-router-dom";
export default function Header() {
  return (
    <header className="bg-gradient-to-b from-[#5EC2DB] to-[#5F44F0] text-white p-4 flex justify-between items-center">
      <div className="relative w-full lg:my-6">
        <div className="w-full flex flex-col lg:flex-row items-center justify-center">
          <div className="w-full ">
            <img src={logo} alt="" className="mx-auto h-4 mt-2 lg:mt-0 lg:h-6 bg-cover" />
          </div>
          <div className="space-x-4 md:absolute w-full lg:w-auto right-0 top-0 mt-6 lg:-mt-2 lg:mr-6">
            <div className="grid grid-cols-4 gap-4 lg:gap-16 justify-between">
              <Link className="text-xs flex flex-col text-center items-center" to="/">
              <img src={iCompany} alt="" className="mb-1 h-5 w-5 lg:h-7 lg:w-7" />Company</Link>
              <Link className="text-xs flex flex-col text-center items-center" to="/tutorial">
              <img src={iTutorial} alt="" className="mb-1 h-5 w-5 lg:h-7 lg:w-7" />Tutorial</Link>
              <Link className="text-xs flex flex-col text-center items-center" to="/chat">
              <img src={iChat} alt="" className="mb-1 h-5 w-5 lg:h-7 lg:w-7" />Chat</Link>
              <Link className="text-xs flex flex-col text-center items-center" to="/cart">
              <img src={iCart} alt="" className="mb-1 h-5 w-5 lg:h-7 lg:w-7" />Keranjang</Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
