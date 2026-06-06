import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
  ],
  theme: {
    colors: {
      primary: '#2563eb',
      success: '#16a34a',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0891b2',
    },
  },
  shortcuts: {
    'btn': 'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    'btn-primary': 'btn bg-primary text-white hover:bg-blue-700',
    'btn-success': 'btn bg-success text-white hover:bg-green-700',
    'btn-warning': 'btn bg-warning text-white hover:bg-amber-700',
    'btn-danger': 'btn bg-danger text-white hover:bg-red-700',
    'btn-secondary': 'btn bg-gray-200 text-gray-800 hover:bg-gray-300',
    'input': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    'select': 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white',
    'label': 'block text-sm font-medium text-gray-700 mb-1',
    'card': 'bg-white rounded-xl shadow-md p-6',
    'badge': 'px-2 py-1 rounded-full text-xs font-medium',
    'table-cell': 'px-4 py-3 text-sm text-gray-700',
  },
});
