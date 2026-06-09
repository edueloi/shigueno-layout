import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Renderiza filhos diretamente em document.body via portal.
 * Garante que modais não sejam afetados por overflow/z-index de ancestrais.
 */
export function Portal({ children }: { children: React.ReactNode }): React.ReactPortal {
  return createPortal(children, document.body);
}
