// import iCart from '../assets/nav/icart.svg';
// import iChat from '../assets/nav/ichat.svg';
// import iCompany from '../assets/nav/icompany.svg';
// import iTutorial from '../assets/nav/itutorial.svg';

import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';

export default function Header() {
    return (
        <header className="flex items-center justify-between bg-gradient-to-b from-[#5EC2DB] to-[#5F44F0] p-4 text-white">
            <div className="relative w-full lg:my-6">
                <div className="flex w-full flex-col items-center justify-center lg:flex-row">
                    <div className="w-full">
                        <AppLogoIcon className="size-40 fill-current text-white dark:text-black" />
                    </div>
                    <div className="top-0 right-0 mt-6 w-full space-x-4 md:absolute lg:-mt-2 lg:mr-6 lg:w-auto">
                        <div className="grid grid-cols-4 justify-between gap-4 lg:gap-16">
                            <Link className="flex flex-col items-center text-center text-xs" href="/">
                                {/* <img src={iCompany} alt="" className="mb-1 h-5 w-5 lg:h-7 lg:w-7" /> */}
                                Company
                            </Link>
                            <Link className="flex flex-col items-center text-center text-xs" href="/tutorial">
                                {/* <img src={iTutorial} alt="" className="mb-1 h-5 w-5 lg:h-7 lg:w-7" /> */}
                                Tutorial
                            </Link>
                            <Link className="flex flex-col items-center text-center text-xs" href="/chat">
                                {/* <img src={iChat} alt="" className="mb-1 h-5 w-5 lg:h-7 lg:w-7" /> */}
                                Chat
                            </Link>
                            <Link className="flex flex-col items-center text-center text-xs" href="/cart">
                                {/* <img src={iCart} alt="" className="mb-1 h-5 w-5 lg:h-7 lg:w-7" /> */}
                                Keranjang
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
