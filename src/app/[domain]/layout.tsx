import React from 'react';
export const runtime = 'edge';
export default function DomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
        {children}
    </>
  );
}
