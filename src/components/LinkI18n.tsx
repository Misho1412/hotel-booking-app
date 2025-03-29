"use client";

import { Link } from '@/i18n/client';
import { useLocale } from '@/i18n/client';
import { ComponentProps, FC } from "react";

interface LinkI18nProps extends Omit<ComponentProps<typeof Link>, 'href'> {
  href: string;
  children: React.ReactNode;
}

// This component wraps the Next.js Link component to ensure proper handling of localized routes
export const LinkI18n: FC<LinkI18nProps> = ({
  href,
  children,
  ...rest
}) => {
  const locale = useLocale();
  
  // Make sure the path starts with the current locale
  const localizedHref = href.startsWith('/') 
    ? `/${locale}${href}`
    : href;
  
  return (
    <Link href={localizedHref} {...rest}>
      {children}
    </Link>
  );
};

export default LinkI18n; 