/**
 * Contratos semânticos para rotas HTTP da pasta `src/app/api/**`.
 * Caminhos absolutos a partir da raiz do site (`/api/...`).
 */
export const apiRoutes = {
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
    qaDirectLogin: '/api/auth/qa-direct-login'
  },
  cargos: {
    collection: '/api/cargos',
    /** Contrato REST futuro — handler pode não existir ainda no App Router. */
    byId: (cargoId: string) => `/api/cargos/${cargoId}`
  },
  ai: {
    cargoStatus: '/api/ai/cargo-status'
  },
  mockMode: {
    root: '/api/mock-mode',
    loginAs: '/api/mock-mode/login-as'
  }
} as const;
