import '../globals.css';
import { Poppins } from 'next/font/google';
import SiteHeader from '@/app/(client-components)/(Header)/SiteHeader';
import ClientCommons from '@/app/(client-components)/ClientCommons';
import { Providers } from '@/app/providers';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '@/i18n/getMessages';
import { LocaleContextProvider } from '@/i18n/client';
import Footer from '@/components/Footer';
import FooterNav from '@/components/FooterNav';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata = {
  title: 'Online Booking | Resort Website',
  description: 'Book your next vacation with us'
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Load messages for the current locale
  const messages = await getMessages(locale);
  
  // Determine RTL direction based on locale
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body className={`${poppins.className} bg-white text-base dark:bg-neutral-900 text-neutral-900 dark:text-neutral-200`}>
        <Providers>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <LocaleContextProvider locale={locale}>
              <ClientCommons />
              <SiteHeader />
              <div className="relative overflow-hidden">
                {children}
              </div>
              <FooterNav />
              <Footer />
            </LocaleContextProvider>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
} 