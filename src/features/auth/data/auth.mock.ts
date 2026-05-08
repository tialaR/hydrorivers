import type { HydroUser } from '../domain/auth.types';

export const defaultUsers: HydroUser[] = [
  {
    id: 'u-shipper-1',
    name: 'Tiala Rocha',
    email: 'tiala@hydrorivers.com',
    company: 'Cooperativa Açaí Norte',
    role: 'shipper',
    approved: true,
    city: 'Belém, PA',
    countryCode: '+55',
    phone: '91999990001',
    phoneE164: '+5591999990001',
    passwordHash: 'pbkdf2_sha256$100000$hydrorivers-tiala$9dcd4a88f3067bdede443b11a6e0b0a4b9156c2ecb9d65ab51d97999cd3d0c56'
  },
  {
    id: 'u-carrier-1',
    name: 'João Navegante',
    email: 'joao@naveganorte.com',
    company: 'Navega Norte',
    role: 'carrier',
    approved: true,
    city: 'Manaus, AM',
    countryCode: '+55',
    phone: '92999990002',
    phoneE164: '+5592999990002',
    passwordHash: 'pbkdf2_sha256$100000$hydrorivers-joao$e5ec12970d513aa07db1f371bbe47bb8c0fb567b859ee26b0986647792a1c40d'
  },
  {
    id: 'u-admin-1',
    name: 'Operação HydroRivers',
    email: 'admin@hydrorivers.com',
    company: 'HydroRivers',
    role: 'admin',
    approved: true,
    city: 'Belém, PA',
    countryCode: '+55',
    phone: '91999990003',
    phoneE164: '+5591999990003',
    passwordHash: 'pbkdf2_sha256$100000$hydrorivers-admin$ab428a37474350a500c4969c3bd1ad6842d292dceef3b037c3206b25bb62d3d5'
  },
  {
    id: 'u-shipper-2',
    name: 'Mariana Tapajós',
    email: 'mariana@bioamazonia.coop',
    company: 'BioAmazônia Cooperativa',
    role: 'shipper',
    approved: true,
    city: 'Santarém, PA',
    countryCode: '+55',
    phone: '93999990004',
    phoneE164: '+5593999990004',
    passwordHash: 'pbkdf2_sha256$100000$hydrorivers-mariana$f48848f7f1cf1228e6f67a0c9878f580e186c1b129b4735955a61303f77add03'
  },
  {
    id: 'u-carrier-2',
    name: 'Carlos Madeira',
    email: 'carlos@hidroviasmadeira.com',
    company: 'Hidrovias Madeira',
    role: 'carrier',
    approved: true,
    city: 'Porto Velho, RO',
    countryCode: '+55',
    phone: '69999990005',
    phoneE164: '+5569999990005',
    passwordHash: 'pbkdf2_sha256$100000$hydrorivers-carlos$6355a3ddc3ee0a74bceaa888703856ec4cbb4e9ce83270b46bfd29625e17b2d0'
  },
  {
    id: 'u-carrier-3',
    name: 'Ana Solimões',
    email: 'ana@rioslog.com',
    company: 'RiosLog Amazônia',
    role: 'carrier',
    approved: false,
    city: 'Tabatinga, AM',
    countryCode: '+55',
    phone: '97999990006',
    phoneE164: '+5597999990006',
    passwordHash: 'pbkdf2_sha256$100000$hydrorivers-ana$a893e202bc19a8c8fb09aa8dfa9f2983b56324069a881b65012afb25e8ff6bae'
  }
];
