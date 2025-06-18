import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

import { get, set } from 'lodash';
import { Business, FeedActivity, FeedActivityWithId, LicenseDocumentWithId, UserDetails, UserDetailsWithId } from 'types';

const feeds = [
  {
    type: 'brain-eye-coordination',
    relatedKey: '-MIpRgj1b7W3W5BUYJgW',
    timestamp: 1643999070479,
    user: {
      firstName: 'Sandy',
      lastName: 'Sandy',
      picture: null
    },
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    id: '0kLVojSt21gz003rX8oT'
  },
  {
    relatedKey: 'hZqmGxNb',
    type: 'video',
    timestamp: 1635878773496,
    user: {
      firstName: 'André',
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff'
    },
    businessId: null,
    id: '0txWH0DEvEZvf5K2cdK5'
  },
  {
    businessId: null,
    type: 'brain-eye-coordination',
    relatedKey: '-M-LYbYQIxIuwNJBXaYS',
    timestamp: 1643146621727,
    user: {
      lastName: 'Bosse',
      firstName: 'Reece',
      picture: null
    },
    id: '152t4AbpmpLonfr7Ofr8'
  },
  {
    user: {
      lastName: 'Analyst',
      picture: null,
      firstName: 'Kishan'
    },
    type: 'speed-read',
    relatedKey: '-Map7KnHze20E2Z3zYYD',
    timestamp: 1636164433642,
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    id: '1ytDking1hkIUgX33bVN'
  },
  {
    user: {
      lastName: 'Bosse',
      picture: null,
      firstName: 'Reece'
    },
    relatedKey: 'nkQZlu4P',
    type: 'video',
    businessId: null,
    timestamp: 1642543791913,
    id: '392zaCnwR9Nh31rWZQi5'
  },
  {
    businessId: null,
    type: 'video',
    user: {
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      firstName: 'André'
    },
    timestamp: 1635878742378,
    relatedKey: 'EFk9hUEG',
    id: '3uGj9niyUT7srV0YVAd1'
  },
  {
    type: 'speed-read',
    businessId: null,
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    relatedKey: '-M39YsZ_HHnGFfxPatYw',
    timestamp: 1642569347469,
    id: '4Xl0bLyx9D1WsLe16gqd'
  },
  {
    type: 'diagnostic',
    businessId: null,
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    timestamp: 1634487377660,
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    id: '5nMmfL61jgrGRJxq6qiq'
  },
  {
    type: 'diagnostic',
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    timestamp: 1639167742308,
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    user: {
      firstName: 'Eric',
      picture: null,
      lastName: 'Lucrezia'
    },
    id: '6Kx2LIKSvDFPVsRhWNKz'
  },
  {
    relatedKey: 'Y4c1RdRw',
    type: 'video',
    businessId: null,
    user: {
      firstName: 'Reece',
      lastName: 'Bosse',
      picture: null
    },
    timestamp: 1643145659903,
    id: '6o0rAv26e2SwYL5BLMH4'
  },
  {
    user: {
      picture: null,
      firstName: 'Reece',
      lastName: 'Bosse'
    },
    relatedKey: '-M39nr_sFIiUcjqRsQwS',
    businessId: null,
    type: 'speed-read',
    timestamp: 1643144851914,
    id: '7i279buoVXR1nwQFF6F0'
  },
  {
    user: {
      lastName: 'Bosse',
      firstName: 'Reece',
      picture: null
    },
    businessId: null,
    type: 'brain-eye-coordination',
    timestamp: 1643146731240,
    relatedKey: '-M-LYbYQIxIuwNJBXaYS',
    id: '84Td9Ypkl0kznEFIhnKF'
  },
  {
    user: {
      firstName: 'André',
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff'
    },
    timestamp: 1634486551202,
    relatedKey: '-Map7KnHze20E2Z3zYYD',
    businessId: null,
    type: 'speed-read',
    id: '8IwNOufpOW7IYoZUGKdL'
  },
  {
    type: 'brain-eye-coordination',
    relatedKey: '-MIpL9PSA5BGTXDIxA2B',
    user: {
      firstName: 'Sandy',
      lastName: 'Sandy',
      picture: null
    },
    timestamp: 1643998291578,
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    id: '8VPBNU3xmed0IxsVzuv5'
  },
  {
    type: 'speed-read',
    user: {
      firstName: 'Vinay',
      lastName: 'Vinay',
      picture: null
    },
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    timestamp: 1643048619913,
    relatedKey: '-M2i-xftSj2t4jtrwPGE',
    id: '8aLU5pmHyy4EAYlzolRy'
  },
  {
    timestamp: 1642542625785,
    user: {
      firstName: 'Reece',
      lastName: 'Bosse',
      picture: null
    },
    type: 'speed-read',
    businessId: null,
    relatedKey: '-M-LYbYQIxIuwNJBXaYS',
    id: '9I86AjF6TFUZ5HZs2fb2'
  },
  {
    type: 'video',
    businessId: null,
    relatedKey: 'rCZxy6YG',
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    timestamp: 1635878941224,
    id: 'BHUZMLu2jGLpI6RVBpgz'
  },
  {
    timestamp: 1637717710869,
    relatedKey: '-M0HOIj_UySAyZGhRPpb',
    businessId: null,
    type: 'diagnostic',
    user: {
      picture: null,
      firstName: 'Joaquin',
      lastName: 'Chun'
    },
    id: 'BbHwT5qZy6drS4cRDosc'
  },
  {
    relatedKey: '-M2F68DdYhBmFpKK39ak',
    businessId: null,
    timestamp: 1643749219498,
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    type: 'brain-eye-coordination',
    id: 'BbMo7BRReG9NY5rl8WCm'
  },
  {
    timestamp: 1641997765816,
    businessId: null,
    user: {
      firstName: 'Kenny',
      picture: null,
      lastName: 'Tan'
    },
    type: 'speed-read',
    relatedKey: '-M2i-xftSj2t4jtrwPGE',
    id: 'CvrOhNhEEkSMvOLWPglX'
  },
  {
    businessId: null,
    timestamp: 1643145150266,
    type: 'video',
    relatedKey: 'o8nd43XR',
    user: {
      lastName: 'Bosse',
      firstName: 'Reece',
      picture: null
    },
    id: 'DIbyF09l18juV2bWZ2xL'
  },
  {
    businessId: null,
    timestamp: 1642544280808,
    user: {
      lastName: 'Bosse',
      firstName: 'Reece',
      picture: null
    },
    relatedKey: '-M-LYbYQIxIuwNJBXaYS',
    type: 'brain-eye-coordination',
    id: 'EfdJU3gjMGDWADF99OjH'
  },
  {
    user: {
      firstName: 'Kishan',
      lastName: 'Analyst',
      picture: null
    },
    type: 'diagnostic',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    timestamp: 1636164604618,
    id: 'EjI374a3vDAnyIPxDexd'
  },
  {
    businessId: null,
    timestamp: 1642543179878,
    user: {
      firstName: 'Reece',
      lastName: 'Bosse',
      picture: null
    },
    type: 'video',
    relatedKey: 'hZqmGxNb',
    id: 'Ex9wZbAR6ud930CEo3YH'
  },
  {
    timestamp: 1643146218717,
    type: 'video',
    businessId: null,
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    relatedKey: 'bteU8NhR',
    id: 'Exq5J29nfoMy9lasc3uK'
  },
  {
    type: 'video',
    businessId: null,
    timestamp: 1642187914060,
    relatedKey: 'ZWIn3iRV',
    user: {
      firstName: 'Kenny',
      picture: null,
      lastName: 'Tan'
    },
    id: 'FgfnCMOsSORdPmYCgMVf'
  },
  {
    businessId: null,
    timestamp: 1640025895150,
    user: {
      picture: null,
      firstName: 'Rhett',
      lastName: 'Barbour'
    },
    type: 'video',
    relatedKey: 'hZqmGxNb',
    id: 'FmfIF5Cuk46K7YrVSTCj'
  },
  {
    timestamp: 1643996458955,
    relatedKey: '-M0Q78T1kT1iggi5TEI1',
    user: {
      picture: null,
      firstName: 'Sandy',
      lastName: 'Sandy'
    },
    type: 'diagnostic',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    id: 'GvdZukItXbQZ1QOx5DCg'
  },
  {
    type: 'practice',
    timestamp: 1643999418184,
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    relatedKey: '-MIpRgj1b7W3W5BUYJgW',
    user: {
      lastName: 'Sandy',
      firstName: 'Sandy',
      picture: null
    },
    id: 'H09LOJrcRwkm10iVKBAu'
  },
  {
    relatedKey: 'rCZxy6YG',
    timestamp: 1640025265457,
    user: {
      firstName: 'Rhett',
      lastName: 'Barbour',
      picture: null
    },
    businessId: null,
    type: 'video',
    id: 'H7JyISrhpPi4af4BTOTH'
  },
  {
    businessId: null,
    relatedKey: 'ZWIn3iRV',
    timestamp: 1635877825010,
    type: 'video',
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    id: 'HFTNJyMVliYeoDLLyVqp'
  },
  {
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    user: {
      lastName: 'Vinay',
      firstName: 'Vinay',
      picture: null
    },
    type: 'diagnostic',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    timestamp: 1643048998113,
    id: 'IUcijPsGbQm1KrXgUTgp'
  },
  {
    relatedKey: '-MIpJwh1e8WNeDi6rpI0',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    type: 'speed-read',
    timestamp: 1643997111086,
    user: {
      lastName: 'Sandy',
      firstName: 'Sandy',
      picture: null
    },
    id: 'JOyxBDOQBDLP9xGY6DHp'
  },
  {
    relatedKey: '-MIpJjs-dU5pRhFpYray',
    timestamp: 1643996834377,
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    user: {
      firstName: 'Sandy',
      picture: null,
      lastName: 'Sandy'
    },
    type: 'speed-read',
    id: 'JT84oJuFkJqwwU15pWZx'
  },
  {
    timestamp: 1639169143026,
    type: 'video',
    user: {
      firstName: 'Eric',
      picture: null,
      lastName: 'Lucrezia'
    },
    relatedKey: 'QWNAa3dz',
    businessId: null,
    id: 'JxhgTIWMaEayIzhb84uX'
  },
  {
    type: 'video',
    businessId: null,
    relatedKey: 'G2QB6Bd4',
    timestamp: 1640954151103,
    user: {
      firstName: 'André',
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff'
    },
    id: 'K93E6ghUBzh4rEoAyvJq'
  },
  {
    type: 'brain-eye-coordination',
    timestamp: 1640953616819,
    businessId: null,
    relatedKey: '-M29wg-ZPfqDzjIG998f',
    user: {
      firstName: 'André',
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff'
    },
    id: 'KbEA0AHCThqWQWm7cmHu'
  },
  {
    timestamp: 1635877775954,
    relatedKey: '3nQyI6Nj',
    businessId: null,
    type: 'video',
    user: {
      firstName: 'André',
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff'
    },
    id: 'KdaCEnsjrhu5XJL3RQMr'
  },
  {
    relatedKey: '-M2DSbbObqedvMCRZkuY',
    businessId: null,
    timestamp: 1643408173267,
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    type: 'speed-read',
    id: 'KrWMqJqpy3EKOqN46XRR'
  },
  {
    user: {
      firstName: 'Kishan',
      picture: null,
      lastName: 'Analyst'
    },
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    timestamp: 1636164650758,
    type: 'diagnostic',
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    id: 'MCYdoBoRH6jGpCdnFPHv'
  },
  {
    relatedKey: 'QslWNgU0',
    type: 'video',
    businessId: null,
    user: {
      firstName: 'Eric',
      lastName: 'Lucrezia',
      picture: null
    },
    timestamp: 1639168909293,
    id: 'MpqnddGfZkNtL68Dy6a2'
  },
  {
    relatedKey: 'c9wywH0k',
    businessId: null,
    user: {
      firstName: 'André',
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff'
    },
    timestamp: 1635879164140,
    type: 'video',
    id: 'N8MAumIsX0qQ8IMIWTBk'
  },
  {
    timestamp: 1640024355600,
    businessId: null,
    user: {
      lastName: 'Barbour',
      firstName: 'Rhett',
      picture: null
    },
    type: 'video',
    relatedKey: 'NECzcY5C',
    id: 'NdRoHMOR2E2ouiqpt9Nl'
  },
  {
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    type: 'video',
    timestamp: 1635878089303,
    businessId: null,
    relatedKey: 'QWNAa3dz',
    id: 'Oa36zhMqebzzbMtPnvzs'
  },
  {
    type: 'speed-read',
    timestamp: 1642481181278,
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    relatedKey: '-MIpaiaUw8BfVVwkjEB_',
    businessId: null,
    id: 'ObcjRq3fAGWQTN7lU10r'
  },
  {
    type: 'video',
    user: {
      firstName: 'Kenny',
      lastName: 'Tan',
      picture: null
    },
    businessId: null,
    timestamp: 1642187736780,
    relatedKey: '3nQyI6Nj',
    id: 'PQdBa8bONntJgthJ7Evm'
  },
  {
    businessId: null,
    timestamp: 1636339530548,
    type: 'diagnostic',
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    user: {
      firstName: 'Gabriel',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/pictures%2F8JNvavdNONOLHiM0STymKlRPu0v2?alt=media&token=3229c3c1-5153-4cc6-8167-5f5c2de3684f',
      lastName: 'de Oliveira'
    },
    id: 'PTZfQYutUFt4074O6DPk'
  },
  {
    user: {
      lastName: 'Bosse',
      firstName: 'Reece',
      picture: null
    },
    relatedKey: 'ZWIn3iRV',
    timestamp: 1643144964355,
    businessId: null,
    type: 'video',
    id: 'PYyFTThWlVcKEVtqnKb1'
  },
  {
    type: 'diagnostic',
    relatedKey: '-M0HBz4EQiYtcIkDm5Sz',
    businessId: null,
    timestamp: 1639090807334,
    user: {
      picture: null,
      lastName: 'Brown',
      firstName: 'Alan'
    },
    id: 'PaMsjSMjD54Ee4yAiz72'
  },
  {
    type: 'video',
    timestamp: 1643145677785,
    relatedKey: 'Y4c1RdRw',
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    businessId: null,
    id: 'PmIbmErLI4xsieXKo2Vd'
  },
  {
    type: 'brain-eye-coordination',
    user: {
      firstName: 'Sandy',
      lastName: 'Sandy',
      picture: null
    },
    timestamp: 1643997928588,
    relatedKey: '-MIpKoKOMfVG_h1inqYW',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    id: 'Q3LFQ6ZuMFSS3fMa1VQ5'
  },
  {
    timestamp: 1640954212905,
    relatedKey: 'o6n69NkD',
    type: 'video',
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    businessId: null,
    id: 'Q7GCzeNn0fcfzAqQYnr6'
  },
  {
    type: 'speed-read',
    businessId: null,
    user: {
      lastName: 'McGibbon',
      picture: null,
      firstName: 'Mike'
    },
    timestamp: 1637254336297,
    relatedKey: '-Map7KnHze20E2Z3zYYD',
    id: 'QpgrC18ovA0CJBMVAEBK'
  },
  {
    timestamp: 1636339536610,
    user: {
      firstName: 'Gabriel',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/pictures%2F8JNvavdNONOLHiM0STymKlRPu0v2?alt=media&token=3229c3c1-5153-4cc6-8167-5f5c2de3684f',
      lastName: 'de Oliveira'
    },
    type: 'diagnostic',
    businessId: null,
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    id: 'RQvsa38agFhhr4U7h4JO'
  },
  {
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    type: 'speed-read',
    timestamp: 1639964101756,
    relatedKey: '-M2A53Yqtnoeqrc40KpO',
    businessId: null,
    id: 'RklBd3Z0NT80c0MiX7Kc'
  },
  {
    user: {
      picture: null,
      lastName: 'Barbour',
      firstName: 'Rhett'
    },
    timestamp: 1640024169827,
    type: 'speed-read',
    businessId: null,
    relatedKey: '-Map7KnHze20E2Z3zYYD',
    id: 'RuaCt3ez3y7nAtGN4m7Z'
  },
  {
    user: {
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      firstName: 'André',
      lastName: 'Paliao'
    },
    timestamp: 1635879181006,
    type: 'video',
    businessId: null,
    relatedKey: 'c9wywH0k',
    id: 'ScZYTpc5WDwXkeQQArIY'
  },
  {
    relatedKey: 'fCC0PZ25',
    businessId: null,
    timestamp: 1643146122512,
    type: 'video',
    user: {
      firstName: 'Reece',
      lastName: 'Bosse',
      picture: null
    },
    id: 'SdTk85LRW1FrkPyptUD7'
  },
  {
    type: 'diagnostic',
    user: {
      lastName: 'Andre gmail',
      firstName: 'Andre gmail',
      picture: null
    },
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    timestamp: 1642551065325,
    id: 'T3NpwNLfk39mm6ds03X7'
  },
  {
    user: {
      firstName: 'Rhett',
      lastName: 'Barbour',
      picture: null
    },
    type: 'video',
    businessId: null,
    timestamp: 1640024321014,
    relatedKey: 'NECzcY5C',
    id: 'TqX7GiwCLhz1JQ0j4PbP'
  },
  {
    user: {
      lastName: 'Tan',
      picture: null,
      firstName: 'Kenny'
    },
    relatedKey: '-M-LZo_hIwGzSP5DhMZ4',
    businessId: null,
    type: 'diagnostic',
    timestamp: 1641999405388,
    id: 'UAs1ppLrzSI3AjvPurZV'
  },
  {
    timestamp: 1640026099818,
    type: 'video',
    relatedKey: 'Y4c1RdRw',
    businessId: null,
    user: {
      picture: null,
      lastName: 'Barbour',
      firstName: 'Rhett'
    },
    id: 'UHPtNoJ70s1acs4CR9lM'
  },
  {
    timestamp: 1643048979561,
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    type: 'diagnostic',
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    user: {
      firstName: 'Vinay',
      picture: null,
      lastName: 'Vinay'
    },
    id: 'V0f8hkWAady5lHuY3Y5B'
  },
  {
    user: {
      picture: null,
      firstName: 'Eric',
      lastName: 'Lucrezia'
    },
    type: 'diagnostic',
    timestamp: 1639168688270,
    relatedKey: '-M-xX_Wkk_07H8fleSwa',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    id: 'V5MWO0Xdvn3calVt7RkT'
  },
  {
    timestamp: 1637717667018,
    type: 'speed-read',
    businessId: null,
    relatedKey: '-MIpaiaUw8BfVVwkjEB_',
    user: {
      firstName: 'Joaquin',
      picture: null,
      lastName: 'Chun'
    },
    id: 'VEFFOBNg9Yns9SbYGv0D'
  },
  {
    businessId: null,
    timestamp: 1636339522604,
    type: 'speed-read',
    relatedKey: '-Map7KnHze20E2Z3zYYD',
    user: {
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/pictures%2F8JNvavdNONOLHiM0STymKlRPu0v2?alt=media&token=3229c3c1-5153-4cc6-8167-5f5c2de3684f',
      firstName: 'Gabriel',
      lastName: 'de Oliveira'
    },
    id: 'WXblVgy72LxDbFzJkAJw'
  },
  {
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    relatedKey: 'NECzcY5C',
    type: 'video',
    timestamp: 1635877940663,
    businessId: null,
    id: 'WvvPIKNhxQVWiZxJGnVt'
  },
  {
    type: 'video',
    businessId: null,
    timestamp: 1635877991308,
    user: {
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      firstName: 'André'
    },
    relatedKey: 'QslWNgU0',
    id: 'WxFIf4B9qv5TjhqPdTQv'
  },
  {
    relatedKey: 'nkQZlu4P',
    user: {
      firstName: 'Alicia',
      lastName: 'Mullane',
      picture: null
    },
    timestamp: 1638413907199,
    type: 'video',
    businessId: null,
    id: 'XTv54aA8aOVKfBN9QOjg'
  },
  {
    user: {
      firstName: 'Reece',
      picture: null,
      lastName: 'Bosse'
    },
    type: 'speed-read',
    timestamp: 1642569983293,
    businessId: null,
    relatedKey: '-M39mFdIrAF0pNfoexWK',
    id: 'XjoSR5dkxryEesY5C0MG'
  },
  {
    type: 'video',
    relatedKey: 'NECzcY5C',
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    businessId: null,
    timestamp: 1643145231426,
    id: 'YX6UlQkfmQ6ZbGQd7uR9'
  },
  {
    user: {
      lastName: 'Bosse',
      firstName: 'Reece',
      picture: null
    },
    relatedKey: 'QslWNgU0',
    businessId: null,
    timestamp: 1643145316385,
    type: 'video',
    id: 'aEjuo1j3QLlZHbWH2tdM'
  },
  {
    type: 'video',
    user: {
      picture: null,
      firstName: 'Reece',
      lastName: 'Bosse'
    },
    relatedKey: 'G2QB6Bd4',
    businessId: null,
    timestamp: 1643145838609,
    id: 'aGcnheKBTWQdHI4aLask'
  },
  {
    timestamp: 1635878845741,
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    businessId: null,
    type: 'video',
    relatedKey: 'yMz9mp2E',
    id: 'ao0e0ND2pmnUqbsQEOEf'
  },
  {
    type: 'speed-read',
    relatedKey: '-M2hsyUAnfUbjaJuAPKD',
    businessId: null,
    timestamp: 1643748434998,
    user: {
      picture: null,
      firstName: 'Reece',
      lastName: 'Bosse'
    },
    id: 'bMS8HgF4SeTAlZpmYqKL'
  },
  {
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    user: {
      firstName: 'Kishan',
      picture: null,
      lastName: 'Analyst'
    },
    relatedKey: '-M2A53Yqtnoeqrc40KpO',
    timestamp: 1636426158206,
    type: 'speed-read',
    id: 'cPX9gISgj3z4pRvYLHDO'
  },
  {
    businessId: null,
    type: 'video',
    relatedKey: '19AltKcI',
    user: {
      picture: null,
      firstName: 'Rhett',
      lastName: 'Barbour'
    },
    timestamp: 1640025576688,
    id: 'cWZ3OjchYTzpkZnBEdDt'
  },
  {
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    timestamp: 1636425951173,
    user: {
      picture: null,
      lastName: 'Analyst',
      firstName: 'Kishan'
    },
    type: 'speed-read',
    relatedKey: '-M29wg-ZPfqDzjIG998f',
    id: 'ca3r1kFygyxNzVd3b9it'
  },
  {
    user: {
      lastName: 'Paliao',
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff'
    },
    type: 'speed-read',
    timestamp: 1635876095234,
    relatedKey: '-M29wg-ZPfqDzjIG998f',
    businessId: null,
    id: 'dQzddOBBgS7ynvDRiFO6'
  },
  {
    type: 'video',
    timestamp: 1642543170044,
    businessId: null,
    relatedKey: 'hZqmGxNb',
    user: {
      firstName: 'Reece',
      picture: null,
      lastName: 'Bosse'
    },
    id: 'dc7qwCiN9JMxmIVE8hvg'
  },
  {
    user: {
      firstName: 'Reece',
      lastName: 'Bosse',
      picture: null
    },
    type: 'speed-read',
    timestamp: 1643408685443,
    relatedKey: '-M2F68DdYhBmFpKK39ak',
    businessId: null,
    id: 'dskgO7v7RjhReso0LR5v'
  },
  {
    user: {
      lastName: 'Lucrezia',
      firstName: 'Eric',
      picture: null
    },
    businessId: null,
    relatedKey: 'EFk9hUEG',
    timestamp: 1639169330359,
    type: 'video',
    id: 'eKQ5rGi0f1o5BWwUHYcV'
  },
  {
    type: 'video',
    timestamp: 1635879199340,
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    businessId: null,
    relatedKey: 'jQGuIKT7',
    id: 'euXA5pt7yQPLkysA77nz'
  },
  {
    timestamp: 1642551056333,
    relatedKey: '-Map7KnHze20E2Z3zYYD',
    type: 'speed-read',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    user: {
      picture: null,
      firstName: 'Andre gmail',
      lastName: 'Andre gmail'
    },
    id: 'fPBRsgNXVIzcNRoXS5KL'
  },
  {
    user: {
      lastName: 'Tan',
      picture: null,
      firstName: 'Kenny'
    },
    type: 'diagnostic',
    relatedKey: '-M-LZo_hIwGzSP5DhMZ4',
    businessId: null,
    timestamp: 1641999409812,
    id: 'flkcVx15NXpCp77QEDeF'
  },
  {
    type: 'video',
    timestamp: 1643145396210,
    relatedKey: 'QWNAa3dz',
    user: {
      firstName: 'Reece',
      lastName: 'Bosse',
      picture: null
    },
    businessId: null,
    id: 'gBZoXdjoq7r5RSmQ8iTd'
  },
  {
    businessId: null,
    type: 'brain-eye-coordination',
    relatedKey: '-M-LYbYQIxIuwNJBXaYS',
    timestamp: 1643146816799,
    user: {
      picture: null,
      firstName: 'Reece',
      lastName: 'Bosse'
    },
    id: 'h44cjcS5RDgZeDL25UV9'
  },
  {
    businessId: null,
    user: {
      firstName: 'Reece',
      lastName: 'Bosse',
      picture: null
    },
    type: 'video',
    relatedKey: 'EFk9hUEG',
    timestamp: 1642542918910,
    id: 'hDb8DrV0OQ12puFOJIWB'
  },
  {
    timestamp: 1642543259225,
    type: 'video',
    businessId: null,
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    relatedKey: 'PSinJUQ6',
    id: 'hRE0QBKSKWDob3Wa1qG5'
  },
  {
    type: 'brain-eye-coordination',
    timestamp: 1643147654383,
    relatedKey: '-M39nr_sFIiUcjqRsQwS',
    businessId: null,
    user: {
      firstName: 'Reece',
      lastName: 'Bosse',
      picture: null
    },
    id: 'hcmkCV2u0muSa8UIc0bR'
  },
  {
    timestamp: 1636514748852,
    user: {
      firstName: 'Gabriel',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/pictures%2F8JNvavdNONOLHiM0STymKlRPu0v2?alt=media&token=3229c3c1-5153-4cc6-8167-5f5c2de3684f',
      lastName: 'de Oliveira'
    },
    relatedKey: '-M29wg-ZPfqDzjIG998f',
    type: 'speed-read',
    businessId: null,
    id: 'i4HlPIi2lFug9OI0ExFT'
  },
  {
    timestamp: 1635877924556,
    user: {
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      firstName: 'André'
    },
    businessId: null,
    type: 'video',
    relatedKey: 'o8nd43XR',
    id: 'iifgIvdkBOK8JOUkEEYl'
  },
  {
    timestamp: 1642543712531,
    businessId: null,
    type: 'video',
    user: {
      lastName: 'Bosse',
      picture: null,
      firstName: 'Reece'
    },
    relatedKey: '3nQyI6Nj',
    id: 'jY8PAfKuEN8OvBxxzgif'
  },
  {
    user: {
      lastName: 'Palião',
      firstName: 'André',
      picture: null
    },
    relatedKey: '-M0HOIj_UySAyZGhRPpb',
    type: 'diagnostic',
    timestamp: 1635879646294,
    businessId: 'BXG05H7GX7ojjj0j0CiO',
    id: 'kDP1qJkTEJDTqB0L0bYC'
  },
  {
    relatedKey: 'NECzcY5C',
    user: {
      firstName: 'Eric',
      picture: null,
      lastName: 'Lucrezia'
    },
    businessId: null,
    timestamp: 1639168840271,
    type: 'video',
    id: 'kTh8Nz5mDBU7sXozVCfe'
  },
  {
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    relatedKey: '-M39nr_sFIiUcjqRsQwS',
    businessId: null,
    type: 'brain-eye-coordination',
    timestamp: 1643147508687,
    id: 'lKseycdEhOBOxtXkP7n7'
  },
  {
    relatedKey: '-M2DOVB-6q96zVH7sEtA',
    timestamp: 1643931080894,
    type: 'speed-read',
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    id: 'mD3RiZte1BN2chKvVDQH'
  },
  {
    relatedKey: 'PSinJUQ6',
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    timestamp: 1643931098659,
    businessId: null,
    type: 'video',
    id: 'n7mSrr2y4FTuh8EZKhTs'
  },
  {
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    businessId: null,
    timestamp: 1642481290927,
    relatedKey: '-M0O_g5hXx3CrUihlDd1',
    type: 'diagnostic',
    id: 'ncGsmDohqGRLNuHz25kT'
  },
  {
    timestamp: 1638413835194,
    type: 'video',
    relatedKey: 'nkQZlu4P',
    user: {
      lastName: 'Mullane',
      picture: null,
      firstName: 'Alicia'
    },
    businessId: null,
    id: 'o4ER3y7ZE8xgmBfixqkB'
  },
  {
    timestamp: 1640026493962,
    type: 'brain-eye-coordination',
    user: {
      picture: null,
      firstName: 'Rhett',
      lastName: 'Barbour'
    },
    relatedKey: '-M29wg-ZPfqDzjIG998f',
    businessId: null,
    id: 'oBvmo5XhfmhJRdkBFj1U'
  },
  {
    timestamp: 1643789309628,
    relatedKey: 'G0szGxhZ',
    businessId: null,
    user: {
      lastName: 'Paliao',
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff'
    },
    type: 'video',
    id: 'oJORN8fDSOfBBcB4YeYf'
  },
  {
    type: 'video',
    businessId: null,
    timestamp: 1640814028188,
    relatedKey: 'G0szGxhZ',
    user: {
      firstName: 'Bara',
      lastName: 'Sapir',
      picture: null
    },
    id: 'okyuqSWoglV5sIqk12PP'
  },
  {
    user: {
      picture: null,
      lastName: 'Palião',
      firstName: 'André'
    },
    relatedKey: '-MIpaiaUw8BfVVwkjEB_',
    timestamp: 1635377072952,
    type: 'speed-read',
    businessId: 'BXG05H7GX7ojjj0j0CiO',
    id: 'qEgWoTnm97bTQyyHpTx7'
  },
  {
    timestamp: 1642542762554,
    businessId: null,
    type: 'video',
    relatedKey: 'G0szGxhZ',
    user: {
      firstName: 'Reece',
      picture: null,
      lastName: 'Bosse'
    },
    id: 'qMiXZYZKhCffvWKObAqr'
  },
  {
    user: {
      lastName: 'Bosse',
      firstName: 'Reece',
      picture: null
    },
    businessId: null,
    type: 'video',
    timestamp: 1643145256543,
    relatedKey: 'NECzcY5C',
    id: 'qwPOZLBOgj6qxUYrj7fC'
  },
  {
    user: {
      picture: null,
      firstName: 'Sandy',
      lastName: 'Sandy'
    },
    timestamp: 1643980929859,
    type: 'speed-read',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    relatedKey: '-MIpaHHyNW_eQPC-YZqv',
    id: 'r4PJorXL4lS1XmD2tWFd'
  },
  {
    timestamp: 1640954332113,
    businessId: null,
    user: {
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao',
      firstName: 'André'
    },
    relatedKey: 'i73kP2Kb',
    type: 'video',
    id: 't995iqnk4RTpbC1GITAL'
  },
  {
    relatedKey: 'G2QB6Bd4',
    businessId: null,
    timestamp: 1640026185416,
    type: 'video',
    user: {
      firstName: 'Rhett',
      picture: null,
      lastName: 'Barbour'
    },
    id: 'tZKg8YLdjhy9zkKTnBkd'
  },
  {
    user: {
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      firstName: 'André'
    },
    businessId: null,
    timestamp: 1635879147742,
    type: 'video',
    relatedKey: 'iwgbezO6',
    id: 'u24qF3QVDmSoEk4XvaWK'
  },
  {
    businessId: null,
    timestamp: 1635877628425,
    type: 'video',
    user: {
      lastName: 'Paliao',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      firstName: 'André'
    },
    relatedKey: 'nkQZlu4P',
    id: 'vWB2uMMtHxBHkWf5HeEs'
  },
  {
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    relatedKey: 'i73kP2Kb',
    businessId: null,
    type: 'video',
    timestamp: 1643145954059,
    id: 'vmf0zdAW88lSGQGaSrwE'
  },
  {
    timestamp: 1639167691666,
    relatedKey: '-Map7KnHze20E2Z3zYYD',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    user: {
      firstName: 'Eric',
      picture: null,
      lastName: 'Lucrezia'
    },
    type: 'speed-read',
    id: 'vqlodbV0YxJVvOsXTwQW'
  },
  {
    timestamp: 1635878800720,
    businessId: null,
    relatedKey: 'Y4c1RdRw',
    type: 'video',
    user: {
      firstName: 'André',
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao'
    },
    id: 'xHMNOfwRXFPBVTQ0U49o'
  },
  {
    timestamp: 1643998656438,
    user: {
      lastName: 'Sandy',
      firstName: 'Sandy',
      picture: null
    },
    relatedKey: '-MIpJjs-dU5pRhFpYray',
    businessId: 'GpOtrbIO6qmfYxi1QNPb',
    type: 'brain-eye-coordination',
    id: 'y39fCZE6ZkUgG37purx3'
  },
  {
    timestamp: 1638363496749,
    type: 'speed-read',
    relatedKey: '-Map7KnHze20E2Z3zYYD',
    businessId: null,
    user: {
      picture: null,
      firstName: 'Marcela',
      lastName: 'Rolim'
    },
    id: 'y7in2i8PklDpiI8r6Rr7'
  },
  {
    type: 'video',
    user: {
      picture: null,
      lastName: 'Bosse',
      firstName: 'Reece'
    },
    timestamp: 1643146387456,
    relatedKey: 'OpURdho4',
    businessId: null,
    id: 'ymJRtpPOyf8Zy5KP4kTd'
  },
  {
    type: 'speed-read',
    user: {
      picture:
        'https://firebasestorage.googleapis.com/v0/b/mindflow-1e15b.appspot.com/o/users%2FIAiDpxcTLEQmZ0bowAzpEMeQ9733%2Fpic.jpg?alt=media&token=50c7b977-3dff-4469-ac75-3954513345ff',
      lastName: 'Paliao',
      firstName: 'André'
    },
    businessId: null,
    relatedKey: '-M39p4JsJeUuaCcX6d7O',
    timestamp: 1635876270824,
    id: 'zu5UGVqxEnsqsC9eUjkE'
  }
];

const activityTypeCounterKeysDictionary = {
  diagnostic: 'diagnostics',
  video: 'videos',
  'brain-eye-coordination': 'brainEyeCoordination',
  'speed-read': 'speedRead',
  practice: 'practices'
};

export const syncFeed = async () => {
  try {
    const firestore = admin.firestore();

    const usersSnap = await firestore.collection('users').get();
    const users = usersSnap.docs.reduce((prev, snap) => {
      return {
        ...prev,
        [snap.id]: snap.data() as UserDetails
      };
    }, {}) as Record<string, UserDetails>;

    // const feedActivitiesSnap = await firestore.collection('feed').get();
    // const feedActivities = feedActivitiesSnap.docs.map((snap) => {
    //   return {
    //     ...snap.data(),
    //     id: snap.id
    //   } as FeedActivityWithId;
    // });

    // const result = feedActivities.filter((feed) => feed.user);

    for (const feedActivity of feeds) {
      // @ts-ignore
      const user = users[feedActivity.user.id];

      // @ts-ignore
      const counterKey = activityTypeCounterKeysDictionary[feedAcitivityType];

      // Decrease
      const currentTestCount = get(user, ['activity', 'counters', counterKey], 0);

      functions.logger.log('Updating user counter key: ', currentTestCount, counterKey);
      set(user, ['activity', 'counters', counterKey], currentTestCount - 1);

      // @ts-ignore
      await firestore.collection('users').doc(feedActivity.user.id).update(user);

      if (user.businessId) {
        functions.logger.info('Business user: ', user.businessId);

        const businessSnap = await firestore.collection('business').doc(user.businessId).get();
        const business = businessSnap.data();

        functions.logger.info('Business request result: ', business);

        // Decrease
        if (business) {
          // Updating counter
          const currentTestCount = get(business, ['activity', 'counters', counterKey], 0);
          set(business, ['activity', 'counters', counterKey], currentTestCount - 1);

          await firestore.collection('business').doc(user.businessId).update(business);

          functions.logger.info('Updating business counters: ', business);
        }
      }
      // await firestore.collection('feed').doc(feedActivity.id).delete();
    }

    // return result;
  } catch (error) {
    functions.logger.error('Critical error: ', error);

    return {
      error
    };
  }
};
