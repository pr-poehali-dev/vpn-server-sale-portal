import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const HERO_BG = 'https://cdn.poehali.dev/projects/aba5ca7c-cc4a-43c2-bf6f-d0d6de727888/files/99a414c1-dcfc-4ec8-b779-c7c59b0679f3.jpg';
const ACCESS_PASSWORD = 'nebula';
const YOOMONEY_WALLET = '4100119478447461';

const PLANS = [
  { name: 'START', price: '250', period: 'мес', speed: '100 Мбит/с', devices: '2', accent: 'cyan', features: ['1 локация на выбор', 'Без логов', 'Поддержка 24/7'] },
  { name: 'PRO', price: '350', period: 'мес', speed: '1 Гбит/с', devices: '5', accent: 'violet', popular: true, features: ['12 локаций', 'Без логов', 'Двойное шифрование', 'Приоритетная поддержка'] },
  { name: 'ULTRA', price: '590', period: 'мес', speed: '10 Гбит/с', devices: '∞', accent: 'cyan', features: ['Все 40+ локаций', 'Выделенный IP', 'Двойное шифрование', 'Персональный менеджер'] },
];

function payViaYoomoney(plan: string, sum: string, email: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://yoomoney.ru/quickpay/confirm.xml';
  form.target = '_blank';
  const fields: Record<string, string> = {
    receiver: YOOMONEY_WALLET,
    'quickpay-form': 'shop',
    targets: `NEBULA VPN — тариф ${plan}`,
    paymentType: 'AC',
    sum,
    label: `nebula_${plan}_${Date.now()}`,
    comment: email ? `Email: ${email}` : '',
    successURL: window.location.href,
  };
  Object.entries(fields).forEach(([k, v]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = v;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

const SERVERS = [
  { city: 'Амстердам', flag: '🇳🇱', ping: 18, load: 32, vless: 'vless://ВСТАВЬ_КЛЮЧ_AMSTERDAM@YOUR_IP:443?type=ws&security=tls#NEBULA-AMS' },
  { city: 'Франкфурт', flag: '🇩🇪', ping: 24, load: 58, vless: 'vless://ВСТАВЬ_КЛЮЧ_FRANKFURT@YOUR_IP:443?type=ws&security=tls#NEBULA-FRA' },
  { city: 'Лондон', flag: '🇬🇧', ping: 29, load: 41, vless: 'vless://ВСТАВЬ_КЛЮЧ_LONDON@YOUR_IP:443?type=ws&security=tls#NEBULA-LON' },
  { city: 'Нью-Йорк', flag: '🇺🇸', ping: 96, load: 27, vless: 'vless://ВСТАВЬ_КЛЮЧ_NEWYORK@YOUR_IP:443?type=ws&security=tls#NEBULA-NYC' },
  { city: 'Токио', flag: '🇯🇵', ping: 142, load: 19, vless: 'vless://ВСТАВЬ_КЛЮЧ_TOKYO@YOUR_IP:443?type=ws&security=tls#NEBULA-TYO' },
  { city: 'Сингапур', flag: '🇸🇬', ping: 158, load: 12, vless: 'vless://ВСТАВЬ_КЛЮЧ_SINGAPORE@YOUR_IP:443?type=ws&security=tls#NEBULA-SIN' },
];

const PAYMENTS = [
  { date: '12.06.2026', plan: 'PRO · 1 мес', sum: '349 ₽', status: 'Оплачено' },
  { date: '12.05.2026', plan: 'PRO · 1 мес', sum: '349 ₽', status: 'Оплачено' },
  { date: '12.04.2026', plan: 'START · 1 мес', sum: '149 ₽', status: 'Оплачено' },
];

const SESSIONS = [
  { device: 'MacBook Pro', os: 'macOS · Амстердам', icon: 'Laptop', current: true },
];

function Login({ onLogin }: { onLogin: () => void }) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const submit = () => {
    if (pass.trim().toLowerCase() === ACCESS_PASSWORD) onLogin();
    else setError(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
      <div className="w-full max-w-md glass rounded-3xl p-8 sm:p-10 relative z-10 animate-scale-in glow-cyan">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-float">
            <Icon name="ShieldCheck" size={32} className="text-background" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-center tracking-wide">NEBULA<span className="gradient-text"> VPN</span></h1>
        <p className="text-center text-muted-foreground text-sm mt-2 mb-8">Закрытая зона. Введите пароль доступа</p>

        <label className="text-xs uppercase tracking-widest text-muted-foreground">Пароль</label>
        <div className="relative mt-2">
          <Icon name="Lock" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="password"
            value={pass}
            onChange={(e) => { setPass(e.target.value); setError(false); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="••••••••"
            className="pl-11 h-12 bg-muted/40 border-border focus-visible:ring-primary text-base"
          />
        </div>
        {error && <p className="text-destructive text-sm mt-2 flex items-center gap-1"><Icon name="TriangleAlert" size={14} /> Неверный пароль</p>}

        <Button onClick={submit} className="w-full h-12 mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base tracking-wider font-semibold glow-cyan">
          ВОЙТИ <Icon name="ArrowRight" size={18} className="ml-1" />
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-6">Подсказка для демо: <span className="text-primary font-mono">nebula</span></p>
      </div>
    </div>
  );
}

function Nav({ active, setActive, onLogout }: { active: string; setActive: (v: string) => void; onLogout: () => void }) {
  const items = [
    { id: 'home', label: 'Главная', icon: 'Home' },
    { id: 'plans', label: 'Тарифы', icon: 'Gem' },
    { id: 'pay', label: 'Оплата', icon: 'CreditCard' },
    { id: 'panel', label: 'Панель', icon: 'LayoutDashboard' },
  ];
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="container flex items-center justify-between h-16">
        <button onClick={() => setActive('home')} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Icon name="ShieldCheck" size={20} className="text-background" />
          </div>
          <span className="font-display font-bold text-lg tracking-wide hidden sm:block">NEBULA<span className="gradient-text"> VPN</span></span>
        </button>
        <nav className="flex items-center gap-1">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={() => setActive(it.id)}
              className={`px-3 sm:px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${active === it.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
            >
              <Icon name={it.icon} size={17} />
              <span className="hidden md:block">{it.label}</span>
            </button>
          ))}
          <button onClick={onLogout} className="ml-1 p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
            <Icon name="LogOut" size={18} />
          </button>
        </nav>
      </div>
    </header>
  );
}

function Home({ setActive }: { setActive: (v: string) => void }) {
  const stats = [
    { value: '40+', label: 'Локаций' },
    { value: '10 Гбит/с', label: 'Скорость' },
    { value: '0', label: 'Логов' },
    { value: '99.9%', label: 'Аптайм' },
  ];
  return (
    <div className="animate-fade-in">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>
        <div className="container relative z-10 py-24 sm:py-36 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs uppercase tracking-widest text-primary mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-glow-pulse" /> Сеть активна
          </div>
          <h1 className="font-display text-5xl sm:text-7xl font-bold tracking-tight leading-[1.05]">
            ТВОЙ ИНТЕРНЕТ — <br /><span className="gradient-text text-glow-cyan">БЕЗ ГРАНИЦ</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mt-6">
            Приватный VPN-сервер премиум-класса. Военное шифрование, нулевые логи и скорость до 10 Гбит/с.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Button onClick={() => setActive('plans')} className="h-13 px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90 font-display tracking-wider font-semibold text-base glow-cyan">
              ВЫБРАТЬ ТАРИФ <Icon name="Zap" size={18} className="ml-1" />
            </Button>
            <Button onClick={() => setActive('panel')} variant="outline" className="h-13 px-8 py-6 border-border bg-muted/30 hover:bg-muted/60 font-display tracking-wider text-base">
              МОЯ ПАНЕЛЬ
            </Button>
          </div>
        </div>
      </section>

      <section className="container -mt-10 relative z-10 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="glass rounded-2xl p-6 text-center hover:glow-cyan transition-all" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="font-display text-3xl font-bold gradient-text">{s.value}</div>
              <div className="text-muted-foreground text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container pb-24">
        <h2 className="font-display text-3xl font-bold text-center mb-12">ПОЧЕМУ <span className="gradient-text">NEBULA</span></h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: 'ShieldCheck', title: 'AES-256 шифрование', desc: 'Тот же стандарт, что используют банки и спецслужбы.' },
            { icon: 'EyeOff', title: 'Политика нулевых логов', desc: 'Мы не храним и не передаём вашу активность третьим лицам.' },
            { icon: 'Gauge', title: 'Гигабитная скорость', desc: 'Стриминг 4K и игры без задержек на всех устройствах.' },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-7 hover:-translate-y-1 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                <Icon name={f.icon} size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Plans({ setActive }: { setActive: (v: string) => void }) {
  return (
    <div className="container py-20 animate-fade-in">
      <div className="text-center mb-14">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">ТАРИФНЫЕ <span className="gradient-text">ПЛАНЫ</span></h1>
        <p className="text-muted-foreground mt-4">Выберите подходящий уровень защиты. Отмена в любой момент.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((p) => (
          <div key={p.name} className={`relative glass rounded-3xl p-8 transition-all hover:-translate-y-2 ${p.popular ? 'glow-violet lg:scale-105' : ''}`}>
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold uppercase tracking-wider">
                Популярный
              </div>
            )}
            <h3 className="font-display text-2xl font-bold tracking-wide">{p.name}</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className={`font-display text-5xl font-bold ${p.accent === 'violet' ? 'text-secondary' : 'text-primary'}`}>{p.price}</span>
              <span className="text-muted-foreground mb-2">₽ / {p.period}</span>
            </div>
            <div className="flex gap-4 mt-5 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground"><Icon name="Gauge" size={15} /> {p.speed}</div>
              <div className="flex items-center gap-1.5 text-muted-foreground"><Icon name="MonitorSmartphone" size={15} /> {p.devices}</div>
            </div>
            <div className="h-px bg-border my-6" />
            <ul className="space-y-3">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Icon name="Check" size={16} className={p.accent === 'violet' ? 'text-secondary' : 'text-primary'} /> {f}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => setActive('pay')}
              className={`w-full mt-8 h-12 font-display tracking-wider font-semibold ${p.popular ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-violet' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
            >
              ПОДКЛЮЧИТЬ
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pay() {
  const [plan, setPlan] = useState('PRO');
  const [email, setEmail] = useState('');
  const sums: Record<string, string> = { START: '250', PRO: '350', ULTRA: '590' };
  return (
    <div className="container py-20 animate-fade-in max-w-2xl">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold">ОПЛАТА <span className="gradient-text">ПОДПИСКИ</span></h1>
        <p className="text-muted-foreground mt-4">Безопасный платёж через ЮMoney</p>
      </div>
      <div className="glass rounded-3xl p-8 glow-cyan">
        <label className="text-xs uppercase tracking-widest text-muted-foreground">Выберите план</label>
        <div className="grid grid-cols-3 gap-3 mt-3">
          {Object.keys(sums).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`py-3 rounded-xl font-display font-semibold tracking-wide transition-all ${plan === p ? 'bg-primary/15 text-primary border border-primary/50' : 'bg-muted/40 text-muted-foreground border border-transparent hover:bg-muted/70'}`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8 p-5 rounded-2xl bg-muted/30 border border-border">
          <span className="text-muted-foreground">К оплате</span>
          <span className="font-display text-3xl font-bold gradient-text">{sums[plan]} ₽</span>
        </div>

        <div className="mt-6 space-y-3">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Email для чека</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.ru" className="h-12 bg-muted/40 border-border focus-visible:ring-primary" />
        </div>

        <Button onClick={() => payViaYoomoney(plan, sums[plan], email)} className="w-full h-14 mt-8 bg-[#8B3FFC] hover:bg-[#7a2ff0] text-white font-display text-base tracking-wider font-semibold flex items-center justify-center gap-2">
          <Icon name="Wallet" size={20} /> ОПЛАТИТЬ ЧЕРЕЗ ЮMONEY
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
          <Icon name="Lock" size={12} /> Платёж защищён · номер кошелька в настройках
        </p>
      </div>
    </div>
  );
}

function ServerList() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (city: string, vless: string) => {
    navigator.clipboard.writeText(vless).then(() => {
      setCopied(city);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary">
        <Icon name="Info" size={16} />
        Скопируй ключ и вставь в Happ: <span className="font-semibold">Добавить сервер → Вставить ссылку</span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVERS.map((s) => (
          <div key={s.city} className="glass rounded-2xl p-5 hover:glow-cyan transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{s.flag}</span>
                <div>
                  <div className="font-display font-semibold">{s.city}</div>
                  <div className="text-xs text-muted-foreground">Пинг {s.ping} мс</div>
                </div>
              </div>
              <Icon name="Circle" size={10} className={s.load < 40 ? 'text-primary' : 'text-secondary'} />
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Нагрузка</span><span>{s.load}%</span></div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${s.load < 40 ? 'bg-primary' : 'bg-secondary'}`} style={{ width: `${s.load}%` }} />
              </div>
            </div>
            <button
              onClick={() => copy(s.city, s.vless)}
              className={`w-full mt-4 h-9 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                copied === s.city
                  ? 'bg-primary/20 text-primary border border-primary/40'
                  : 'bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary border border-transparent'
              }`}
            >
              <Icon name={copied === s.city ? 'Check' : 'Copy'} size={15} />
              {copied === s.city ? 'Скопировано!' : 'Копировать VLESS-ключ'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Panel() {
  const [tab, setTab] = useState('overview');
  const tabs = [
    { id: 'overview', label: 'Обзор', icon: 'Activity' },
    { id: 'servers', label: 'Серверы', icon: 'Server' },
    { id: 'devices', label: 'Устройства', icon: 'MonitorSmartphone' },
    { id: 'billing', label: 'Платежи', icon: 'Receipt' },
    { id: 'profile', label: 'Профиль', icon: 'User' },
  ];
  return (
    <div className="container py-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold">Панель <span className="gradient-text">управления</span></h1>
          <p className="text-muted-foreground text-sm mt-1">Тариф PRO · активен до 12.07.2026</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-glow-pulse" />
          <span className="text-sm font-medium">Защита включена</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all ${tab === t.id ? 'bg-primary/15 text-primary' : 'glass text-muted-foreground hover:text-foreground'}`}
          >
            <Icon name={t.icon} size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="glass rounded-2xl p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2"><Icon name="Activity" size={18} className="text-primary" /> Текущее подключение</h3>
            <div className="grid grid-cols-3 gap-4">
              {[{ l: 'Локация', v: '🇳🇱 Амстердам' }, { l: 'Скорость', v: '847 Мбит/с' }, { l: 'Пинг', v: '18 мс' }].map((x) => (
                <div key={x.l} className="p-4 rounded-xl bg-muted/30">
                  <div className="text-xs text-muted-foreground">{x.l}</div>
                  <div className="font-display text-lg font-semibold mt-1">{x.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Трафик за месяц</span><span>312 / ∞ ГБ</span></div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: '42%' }} />
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2"><Icon name="RefreshCw" size={18} className="text-secondary" /> Подписка</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">План</span><span className="font-semibold">PRO</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Продление</span><span className="font-semibold text-primary">Авто · 12.07</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Стоимость</span><span className="font-semibold">349 ₽/мес</span></div>
            </div>
            <Button variant="outline" className="w-full mt-5 border-border bg-muted/30 hover:bg-muted/60">Управлять подпиской</Button>
          </div>
        </div>
      )}

      {tab === 'servers' && (
        <ServerList />
      )}

      {tab === 'devices' && (
        <div className="space-y-4 max-w-2xl">
          {SESSIONS.map((s) => (
            <div key={s.device} className="glass rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Icon name={s.icon} size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-display font-semibold flex items-center gap-2">{s.device} {s.current && <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">Текущее</span>}</div>
                  <div className="text-xs text-muted-foreground">{s.os}</div>
                </div>
              </div>
              {!s.current && <button className="text-muted-foreground hover:text-destructive transition-colors"><Icon name="X" size={18} /></button>}
            </div>
          ))}
        </div>
      )}

      {tab === 'billing' && (
        <div className="glass rounded-2xl p-6 max-w-3xl">
          <h3 className="font-display text-lg font-semibold mb-5">История платежей</h3>
          <div className="space-y-2">
            {PAYMENTS.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3">
                  <Icon name="Receipt" size={18} className="text-primary" />
                  <div>
                    <div className="text-sm font-medium">{p.plan}</div>
                    <div className="text-xs text-muted-foreground">{p.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display font-semibold">{p.sum}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="grid lg:grid-cols-2 gap-5 max-w-4xl">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2"><Icon name="KeyRound" size={18} className="text-primary" /> Смена пароля</h3>
            <div className="space-y-3">
              <Input type="password" placeholder="Текущий пароль" className="h-11 bg-muted/40 border-border" />
              <Input type="password" placeholder="Новый пароль" className="h-11 bg-muted/40 border-border" />
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Обновить пароль</Button>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2"><Icon name="ShieldCheck" size={18} className="text-secondary" /> Безопасность</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm">Двухфакторная аутентификация</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">Вкл</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm">Логи входов</span>
                <button className="text-primary text-sm">Смотреть</button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <span className="text-sm">Чат поддержки · FAQ</span>
                <button className="text-primary text-sm">Открыть</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Index = () => {
  const [logged, setLogged] = useState(false);
  const [active, setActive] = useState('home');

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  return (
    <div className="min-h-screen">
      <Nav active={active} setActive={setActive} onLogout={() => setLogged(false)} />
      {active === 'home' && <Home setActive={setActive} />}
      {active === 'plans' && <Plans setActive={setActive} />}
      {active === 'pay' && <Pay />}
      {active === 'panel' && <Panel />}
      <footer className="border-t border-border/60 py-8 text-center text-muted-foreground text-sm">
        <div className="container">NEBULA VPN © 2026 · Контакты, оферта и реквизиты — в настройках сайта</div>
      </footer>
    </div>
  );
};

export default Index;