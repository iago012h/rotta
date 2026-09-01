import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rotta | Planejador de Viagens e Roteiros Inteligentes",
  description: "Descubra seu próximo destino. A Rotta monta roteiros de viagem otimizados e encontra as melhores opções dentro do seu orçamento, no Brasil e no mundo.",
  keywords: "viagem, roteiro de viagem, turismo, passagens baratas, destinos, inteligência artificial, planejamento de viagem",
  authors: [{ name: "Rotta Team" }],
  openGraph: {
    title: "Rotta | A sua próxima jornada começa aqui.",
    description: "Roteiros inteligentes que cabem no seu bolso.",
    locale: "pt_BR",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
