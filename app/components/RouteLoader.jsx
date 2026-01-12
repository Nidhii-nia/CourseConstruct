'use client';

import { Suspense } from 'react';
import RouteLoaderInner from './RouteLoaderInner'

export default function RouteLoader() {
  return (
    <Suspense fallback={null}>
      <RouteLoaderInner />
    </Suspense>
  );
}
