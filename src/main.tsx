import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// 👇 السطر الأول الجديد: بنعرف الكود على أداة الإحصائيات
import { Analytics } from '@vercel/analytics/react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* 👇 السطر الثاني الجديد: بنشغل الأداة جوه الموقع */}
    <Analytics />
  </StrictMode>,
);