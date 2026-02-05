
import React from 'react';
import { Github, Twitter, Youtube, Coffee, Heart, Info, Book } from 'lucide-react';

export const About: React.FC = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Info className="text-primary" />
                        Tentang Aplikasi
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Informasi mengenai aplikasi dan pengembang</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="text-center w-full mx-auto">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Cemilan KasirPOS</h2>
                        <div className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium mb-4">
                            v0.1.0 React-PHP
                        </div>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Aplikasi kasir (Point of Sales) sederhana namun powerful untuk membantu pencatatan transaksi dan manajemen stok usaha Anda.
                        </p>
                    </div>

                    <div className="w-full h-px bg-slate-100 my-8"></div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://github.com/dotslashgabut/CemilanKasirPOS-Aplikasi-Kasir-React-PHP"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group"
                        >
                            <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Github size={24} />
                            </div>
                            <span className="font-semibold text-slate-700">Source Code</span>
                            <span className="text-xs text-slate-500 mt-1">GitHub</span>
                        </a>

                        <a
                            href="https://x.com/dotslashgabut"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group"
                        >
                            <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Twitter size={24} />
                            </div>
                            <span className="font-semibold text-slate-700">Follow Updates</span>
                            <span className="text-xs text-slate-500 mt-1">X (Twitter)</span>
                        </a>

                        <a
                            href="https://www.youtube.com/@dotslashgabut"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group"
                        >
                            <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Youtube size={24} />
                            </div>
                            <span className="font-semibold text-slate-700">Tutorials</span>
                            <span className="text-xs text-slate-500 mt-1">YouTube</span>
                        </a>

                        <a
                            href="https://trakteer.id/dotslashgabut"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group"
                        >
                            <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Book size={24} />
                            </div>
                            <span className="font-semibold text-slate-700">Tutorials</span>
                            <span className="text-xs text-slate-500 mt-1">Trakteer</span>
                        </a>

                        <a
                            href="https://saweria.co/dotslashgabut"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group"
                        >
                            <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Coffee size={24} />
                            </div>
                            <span className="font-semibold text-slate-700">Support Us</span>
                            <span className="text-xs text-slate-500 mt-1">Saweria</span>
                        </a>

                        <a
                            href="https://ko-fi.com/dotslashgabut"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 group"
                        >
                            <div className="w-12 h-12 bg-sky-500 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Heart size={24} />
                            </div>
                            <span className="font-semibold text-slate-700">Support Us</span>
                            <span className="text-xs text-slate-500 mt-1">Ko-fi</span>
                        </a>
                    </div>

                    <div className="mt-12 text-slate-400 text-sm">
                        <p>© {new Date().getFullYear()} Dotslashgabut</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
