// Wrapper para fetch que injeta o cabeçalho do domínio
// Nota: process.env.API_URL é injetado pelo next.config.js
const API_BASE =
  process.env.API_URL || 'https://api-smart-store.local.fluxoclean.com.br/api';

export async function fetchStoreData(domain: string, endpoint: string) {
  // FIX: Bypass SSL verification for local development environments to avoid UNABLE_TO_VERIFY_LEAF_SIGNATURE
  if (process.env.NODE_ENV === 'development' || API_BASE.includes('.local.')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  try {
    const res = await fetch(`${API_BASE}/storefront/${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Domain': domain, // OBRIGATÓRIO: Identifica a loja
      },
      // Cache estratégico: Revalida a cada 60 segundos
      next: { revalidate: 60 },
    } as any);

    if (!res.ok) {
      if (res.status === 404) return null;
      // Tenta ler o erro do backend se disponível para debug
      const errText = await res.text().catch(() => 'Unknown Error');
      console.error(`API Error (${res.status} on ${endpoint}):`, errText);
      throw new Error('Falha ao buscar dados');
    }

    return await res.json();
  } catch (error) {
    console.error('API Connection Error:', error);
    return null;
  }
}

export async function postStoreData(
  domain: string,
  endpoint: string,
  body: any
) {
  // FIX: Bypass SSL verification for local development environments
  if (process.env.NODE_ENV === 'development' || API_BASE.includes('.local.')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const res = await fetch(`${API_BASE}/storefront/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Domain': domain,
    },
    body: JSON.stringify(body),
  });
  return await res.json();
}
