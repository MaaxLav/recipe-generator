'use client';

import { ShoppingBasket } from 'lucide-react';
import { useState } from 'react';

export function ProductImage({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-[50px] w-[50px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f8f5ef]">
      {src && !failed ? (
        <img
          alt=""
          width={50}
          height={50}
          referrerPolicy="no-referrer"
          className="h-full w-full object-contain"
          src={src}
          onError={() => setFailed(true)}
        />
      ) : (
        <ShoppingBasket size={22} className="text-[#a39888]" />
      )}
    </div>
  );
}
