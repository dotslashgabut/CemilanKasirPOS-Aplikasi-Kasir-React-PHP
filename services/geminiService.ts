import { GoogleGenAI } from "@google/genai";
import { Transaction, Product } from "../types";

const apiKey = process.env.API_KEY || ''; 

export const getBusinessInsights = async (transactions: Transaction[], products: Product[]): Promise<string> => {
  if (!apiKey) return "API Key tidak ditemukan. Silakan konfigurasi API Key untuk menggunakan fitur AI.";

  const ai = new GoogleGenAI({ apiKey });

  // Summarize data for the prompt to save tokens
  const today = new Date().toISOString().split('T')[0];
  const todaysTransactions = transactions.filter(t => t.date.startsWith(today));
  const totalRevenue = todaysTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const lowStock = products.filter(p => p.stock < 10).map(p => `${p.name} (${p.stock})`);

  const prompt = `
    Bertindaklah sebagai konsultan bisnis senior untuk toko 'Makanan Ringan'.
    Berikut adalah data hari ini (${today}):
    - Total Pendapatan: Rp ${totalRevenue}
    - Jumlah Transaksi: ${todaysTransactions.length}
    - Barang Stok Menipis: ${lowStock.join(', ') || 'Tidak ada'}
    
    Berikan analisis singkat (maksimal 3 paragraf) tentang performa hari ini dan 2 saran taktis untuk besok.
    Gunakan Bahasa Indonesia yang profesional namun mudah dimengerti.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Tidak dapat menghasilkan analisis saat ini.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi asisten AI.";
  }
};