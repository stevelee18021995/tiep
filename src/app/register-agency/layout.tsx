import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accounts Centre',
  icons: {
    icon: '/2023_Facebook_icon.svg',
  },
};

export default function RegisterAgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
