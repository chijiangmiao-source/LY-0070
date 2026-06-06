import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';
import './global.css';

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>眼镜门店镜架试戴看板</title>
      </head>
      <body lang="zh-CN">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
