import { dashboard, login, register } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|playfair-display:400,700|cormorant-garamond:400,600" rel="stylesheet" />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035]"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a]"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </nav>
                </header>
                <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
                    <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-6xl lg:flex-row lg:items-center lg:gap-12">
                        <div className="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-[#fff2f2] lg:mb-0 lg:aspect-[4/5] lg:w-[480px] lg:rounded-lg lg:shadow-2xl">
                            <img
                                src="/dk_bg.jpeg"
                                alt="Debbie & Krys Beach Resort"
                                className="w-full h-full object-cover transition-all duration-750"
                            />
                            <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-lg" />
                        </div>

                        <div className="flex flex-col items-center lg:items-start lg:flex-1 text-center lg:text-left space-y-8 py-12 lg:py-0">
                            <div className="space-y-6">
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1b1b18] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Debbie & Krys
                                </h1>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#F53003] tracking-wide" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                    Beach Resort
                                </h2>
                            </div>

                            <div className="w-24 h-px bg-gradient-to-r from-[#F53003] to-[#FF6B47]"></div>

                            <div className="space-y-3 text-base lg:text-lg text-[#4a4a47]" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-[#F53003] flex-shrink-0" />
                                    <span>Sampaguita, Bauan, Batangas, Philippines</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-[#F53003] flex-shrink-0" />
                                    <span>0927 821 0836</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-[#F53003] flex-shrink-0" />
                                    <span>debbiekrysb@gmail.com</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    href='#'
                                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-[#F53003] border border-[#F53003] rounded-md hover:bg-[#E02A00] hover:border-[#E02A00] transition-colors duration-200"
                                >
                                    Book Now
                                </Link>
                            </div>
                        </div>
                    </main>
                </div>
                <div className="hidden h-14.5 lg:block"></div>
            </div>
        </>
    );
}
