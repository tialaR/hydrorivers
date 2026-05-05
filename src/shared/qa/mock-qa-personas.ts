import { demoPassword } from '@/features/auth/domain/auth-constants';
import { intlAppPaths } from '@/shared/routing/app-routes';

export type MockQaPersonaId = 'tiala' | 'joao' | 'carlos' | 'ana' | 'admin';

export type MockQaActionKey =
  | 'openDashboard'
  | 'openCargas'
  | 'tryCargoAssistant'
  | 'tryAccessBlock'
  | 'openAdminMockMode';

export type MockQaPersona = {
  id: MockQaPersonaId;
  mockUserId: string;
  email: string;
  password: string;
  role: 'shipper' | 'carrier' | 'admin';
  approved: boolean;
  companyDisplay: string;
  directLoginRedirectPath: string;
  suggestedActions: readonly MockQaActionKey[];
};

export const MOCK_QA_PERSONAS: readonly MockQaPersona[] = [
  {
    id: 'tiala',
    mockUserId: 'u-shipper-1',
    email: 'tiala@hydrorivers.com',
    password: demoPassword,
    role: 'shipper',
    approved: true,
    companyDisplay: 'Cooperativa Açaí Norte',
    directLoginRedirectPath: intlAppPaths.cargos.marketplace,
    suggestedActions: ['openDashboard', 'openCargas', 'tryCargoAssistant']
  },
  {
    id: 'joao',
    mockUserId: 'u-carrier-1',
    email: 'joao@naveganorte.com',
    password: demoPassword,
    role: 'carrier',
    approved: true,
    companyDisplay: 'Navega Norte',
    directLoginRedirectPath: intlAppPaths.cargos.marketplace,
    suggestedActions: ['openDashboard', 'openCargas', 'tryCargoAssistant', 'tryAccessBlock']
  },
  {
    id: 'carlos',
    mockUserId: 'u-carrier-2',
    email: 'carlos@hidroviasmadeira.com',
    password: demoPassword,
    role: 'carrier',
    approved: true,
    companyDisplay: 'Hidrovias Madeira',
    directLoginRedirectPath: intlAppPaths.cargos.marketplace,
    suggestedActions: ['openDashboard', 'openCargas', 'tryCargoAssistant', 'tryAccessBlock']
  },
  {
    id: 'ana',
    mockUserId: 'u-carrier-3',
    email: 'ana@rioslog.com',
    password: demoPassword,
    role: 'carrier',
    approved: false,
    companyDisplay: 'RiosLog Amazônia',
    directLoginRedirectPath: intlAppPaths.auth.profile,
    suggestedActions: ['openDashboard', 'openCargas', 'tryAccessBlock']
  },
  {
    id: 'admin',
    mockUserId: 'u-admin-1',
    email: 'admin@hydrorivers.com',
    password: demoPassword,
    role: 'admin',
    approved: true,
    companyDisplay: 'HydroRivers',
    directLoginRedirectPath: intlAppPaths.admin.home,
    suggestedActions: ['openDashboard', 'openCargas', 'openAdminMockMode']
  }
] as const;
