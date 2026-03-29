import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';

export const cacheLtr = createCache({ key: 'mui', prepend: true });

export const cacheRtl = createCache({
  key: 'mui-rtl',
  prepend: true,
  stylisPlugins: [prefixer, rtlPlugin],
});
