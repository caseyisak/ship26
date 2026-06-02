import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export function ProductBreadcrumb({ productName }: { productName: string }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-5xl px-6 pt-6"
    >
      <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <li>
          <Link
            href="/products"
            className="hover:text-foreground transition-colors"
          >
            Products
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight className="h-3.5 w-3.5" />
        </li>
        <li className="text-foreground font-medium truncate">{productName}</li>
      </ol>
    </nav>
  );
}
