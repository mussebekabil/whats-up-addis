'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
  const [year, setYear] = useState<number>();

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-primary-600 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>
          &copy; {year || '2025'} What&apos;s Up Addis. All rights reserved.
        </p>
        <p className="text-sm text-primary-100 mt-2">
          Discover events happening in Addis Ababa, Ethiopia
        </p>
      </div>
    </footer>
  );
}
