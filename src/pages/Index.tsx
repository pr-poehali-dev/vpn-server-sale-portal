import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const API = {
  auth: 'https://functions.poehali.dev/14c2e308-7653-40a6-8d2a-f56f27122e5d',
  subscriptions: 'https://functions.poehali.dev/effb9ea7-8cc5-434c-be6f-b9055c568fe2',
  servers: 'https://functions.poehali.dev/09570df7-2cea-443e-92f7-aad29c8ea429',
};

type User = { user_id: number; email: string; username: string; token: string; subscription: Subscription | null };
type Subscription = { plan: string; status: string; expires_at: string; auto_renew: boolean };
type Payment = { plan: string; amount: number; status: string; paid_at: string };
type ServerKey = { id: number; city: string; flag: string; vless: string; ping: number; load: number; active: boolean };

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

const VPN_KEY = 'https://sub.nn-id.com/5882n_4XsW3SrVJq';

const SERVERS = [
  { city: 'Амстердам', flag: '🇳🇱', ping: 18, load: 32, vless: VPN_KEY },
  { city: 'Франкфурт', flag: '🇩🇪', ping: 24, load: 58, vless: VPN_KEY },
  { city: 'Лондон', flag: '🇬🇧', ping: 29, load: 41, vless: VPN_KEY },
  { city: 'Нью-Йорк', flag: '🇺🇸', ping: 96, load: 27, vless: VPN_KEY },
  { city: 'Токио', flag: '🇯🇵', ping: 142, load: 19, vless: VPN_KEY },
  { city: 'Сингапур', flag: '🇸🇬', ping: 158, load: 12, vless: VPN_KEY },
];

const PAYMENTS = [
  { date: '12.06.2026', plan: 'PRO · 1 мес', sum: '349 ₽', status: 'Оплачено' },
  { date: '12.05.2026', plan: 'PRO · 1 мес', sum: '349 ₽', status: 'Оплачено' },
  { date: '12.04.2026', plan: 'START · 1 мес', sum: '149 ₽', status: 'Оплачено' },
];

const SESSIONS = [
  { device: 'MacBook Pro', os: 'macOS · Амстердам', icon: 'Laptop', current: true },
];

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [sitePass, setSitePass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (sitePass.trim().toLowerCase() !== ACCESS_PASSWORD) {
      setError('Неверный пароль доступа к сайту');
      return;
    }
    if (!email || !pass) { setError('Заполните все поля'); return; }
    setLoading(true); setError('');
    try {
      const endpoint = mode === 'login' ? '/login' : '/register';
      const res = await fetch(API.auth + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Ошибка входа'); return; }
      onLogin(data);
    } catch {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
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
        <p className="text-center text-muted-foreground text-sm mt-2 mb-6">Закрытая зона. Введите пароль доступа</p>

        <div className="flex rounded-xl bg-muted/30 p-1 mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
              {m === 'login' ? 'Войти' : 'Регистрация'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Icon name="Lock" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={sitePass} onChange={(e) => { setSitePass(e.target.value); setError(''); }} placeholder="Пароль сайта" className="pl-10 h-11 bg-muted/40 border-border" />
          </div>
          <div className="relative">
            <Icon name="Mail" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} placeholder="Email" type="email" className="pl-10 h-11 bg-muted/40 border-border" />
          </div>
          <div className="relative">
            <Icon name="KeyRound" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={pass} onChange={(e) => { setPass(e.target.value); setError(''); }} onKeyDown={(e) => e.key === 'Enter' && submit()} placeholder="Пароль аккаунта" type="password" className="pl-10 h-11 bg-muted/40 border-border" />
          </div>
        </div>

        {error && <p className="text-destructive text-sm mt-3 flex items-center gap-1"><Icon name="TriangleAlert" size={14} /> {error}</p>}

        <Button onClick={submit} disabled={loading} className="w-full h-12 mt-5 bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base tracking-wider font-semibold glow-cyan">
          {loading ? <Icon name="Loader" size={18} className="animate-spin" /> : <>{mode === 'login' ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'} <Icon name="ArrowRight" size={18} className="ml-1" /></>}
        </Button>
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
  const [paid, setPaid] = useState(false);
  const [copied, setCopied] = useState(false);
  const sums: Record<string, string> = { START: '250', PRO: '350', ULTRA: '590' };

  const handlePay = () => {
    payViaYoomoney(plan, sums[plan], email);
    setTimeout(() => setPaid(true), 1500);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(VPN_KEY).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

        <Button onClick={handlePay} className="w-full h-14 mt-8 bg-[#8B3FFC] hover:bg-[#7a2ff0] text-white font-display text-base tracking-wider font-semibold flex items-center justify-center gap-2">
          <Icon name="Wallet" size={20} /> ОПЛАТИТЬ ЧЕРЕЗ ЮMONEY
        </Button>
        <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
          <Icon name="Lock" size={12} /> Платёж защищён
        </p>
      </div>

      {paid && (
        <div className="mt-6 glass rounded-3xl p-8 glow-cyan animate-fade-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Icon name="CheckCircle" size={22} className="text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">Оплата прошла!</h3>
              <p className="text-muted-foreground text-sm">Скопируй ключ и добавь в Happ</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-muted/40 border border-primary/20 font-mono text-xs break-all text-primary mb-4">
            {VPN_KEY}
          </div>
          <button
            onClick={copyKey}
            className={`w-full h-11 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm ${copied ? 'bg-primary/20 text-primary border border-primary/40' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
          >
            <Icon name={copied ? 'Check' : 'Copy'} size={17} />
            {copied ? 'Скопировано!' : 'Скопировать ключ подключения'}
          </button>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Happ → Добавить сервер → Вставить ссылку
          </p>
        </div>
      )}
    </div>
  );
}

function ServerList({ dbServers }: { dbServers: ServerKey[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (city: string, vless: string) => {
    navigator.clipboard.writeText(vless).then(() => {
      setCopied(city);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const list = dbServers.length > 0
    ? dbServers.map(s => ({ city: s.city, flag: s.flag, ping: s.ping, load: s.load, vless: s.vless }))
    : SERVERS;

  return (
    <div>
      <div className="flex items-center gap-2 mb-5 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary">
        <Icon name="Info" size={16} />
        Скопируй ключ и вставь в Happ: <span className="font-semibold">Добавить сервер → Вставить ссылку</span>
        {dbServers.length > 0 && <span className="ml-auto text-xs bg-primary/20 px-2 py-0.5 rounded-full">{dbServers.length} из БД</span>}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((s) => (
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

function Panel({ user }: { user: User }) {
  const [tab, setTab] = useState('overview');
  const [subscription, setSubscription] = useState<Subscription | null>(user.subscription);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dbServers, setDbServers] = useState<ServerKey[]>([]);
  const [traffic, setTraffic] = useState({ used_gb: 0, limit_gb: null as number | null });
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const loadData = useCallback(async () => {
    const [subRes, payRes, srvRes, trafRes] = await Promise.all([
      fetch(`${API.subscriptions}/status?user_id=${user.user_id}`),
      fetch(`${API.subscriptions}/payments?user_id=${user.user_id}`),
      fetch(`${API.servers}/keys?user_id=${user.user_id}`),
      fetch(`${API.servers}/traffic?user_id=${user.user_id}`),
    ]);
    const [subData, payData, srvData, trafData] = await Promise.all([subRes.json(), payRes.json(), srvRes.json(), trafRes.json()]);
    if (subData.subscription) setSubscription(subData.subscription);
    if (payData.payments) setPayments(payData.payments);
    if (srvData.servers) setDbServers(srvData.servers);
    if (trafData) setTraffic({ used_gb: trafData.used_gb || 0, limit_gb: trafData.limit_gb });
  }, [user.user_id]);

  useEffect(() => { loadData(); }, [loadData]);

  const changePassword = async () => {
    setPassMsg('');
    const res = await fetch(`${API.auth}/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, old_password: oldPass, new_password: newPass }),
    });
    const data = await res.json();
    setPassMsg(res.ok ? '✓ Пароль обновлён' : data.error || 'Ошибка');
    if (res.ok) { setOldPass(''); setNewPass(''); }
  };

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
          <p className="text-muted-foreground text-sm mt-1">
            {subscription ? `Тариф ${subscription.plan} · активен до ${new Date(subscription.expires_at).toLocaleDateString('ru')}` : 'Нет активной подписки'}
          </p>
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
            <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2"><Icon name="Activity" size={18} className="text-primary" /> Аккаунт</h3>
            <div className="grid grid-cols-2 gap-4">
              {[{ l: 'Email', v: user.email }, { l: 'Имя', v: user.username || '—' }].map((x) => (
                <div key={x.l} className="p-4 rounded-xl bg-muted/30">
                  <div className="text-xs text-muted-foreground">{x.l}</div>
                  <div className="font-semibold mt-1 truncate">{x.v}</div>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Трафик использован</span>
                <span>{traffic.used_gb} / {traffic.limit_gb ? `${traffic.limit_gb} ГБ` : '∞'}</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: traffic.limit_gb ? `${Math.min(100, (traffic.used_gb / traffic.limit_gb) * 100)}%` : '5%' }} />
              </div>
            </div>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2"><Icon name="RefreshCw" size={18} className="text-secondary" /> Подписка</h3>
            {subscription ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">План</span><span className="font-semibold">{subscription.plan}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Статус</span><span className="font-semibold text-primary">{subscription.status === 'active' ? 'Активна' : subscription.status}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">До</span><span className="font-semibold">{new Date(subscription.expires_at).toLocaleDateString('ru')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Автопродление</span><span className={subscription.auto_renew ? 'text-primary font-semibold' : 'text-muted-foreground'}>{subscription.auto_renew ? 'Вкл' : 'Выкл'}</span></div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Нет активной подписки</p>
            )}
            <Button onClick={() => setTab('billing')} variant="outline" className="w-full mt-5 border-border bg-muted/30 hover:bg-muted/60">История платежей</Button>
          </div>
        </div>
      )}

      {tab === 'servers' && (
        <ServerList dbServers={dbServers} />
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
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">Платежей пока нет</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Icon name="Receipt" size={18} className="text-primary" />
                    <div>
                      <div className="text-sm font-medium">{p.plan} · 1 мес</div>
                      <div className="text-xs text-muted-foreground">{new Date(p.paid_at).toLocaleDateString('ru')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-display font-semibold">{p.amount} ₽</span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                      {p.status === 'paid' ? 'Оплачено' : p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'profile' && (
        <div className="grid lg:grid-cols-2 gap-5 max-w-4xl">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-5 flex items-center gap-2"><Icon name="KeyRound" size={18} className="text-primary" /> Смена пароля</h3>
            <div className="space-y-3">
              <Input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="Текущий пароль" className="h-11 bg-muted/40 border-border" />
              <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Новый пароль (мин. 6 симв.)" className="h-11 bg-muted/40 border-border" />
              {passMsg && <p className={`text-sm ${passMsg.startsWith('✓') ? 'text-primary' : 'text-destructive'}`}>{passMsg}</p>}
              <Button onClick={changePassword} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Обновить пароль</Button>
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
  const [user, setUser] = useState<User | null>(null);
  const [active, setActive] = useState('home');

  if (!user) return <Login onLogin={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen">
      <Nav active={active} setActive={setActive} onLogout={() => setUser(null)} />
      {active === 'home' && <Home setActive={setActive} />}
      {active === 'plans' && <Plans setActive={setActive} />}
      {active === 'pay' && <Pay />}
      {active === 'panel' && <Panel user={user} />}
      <footer className="border-t border-border/60 py-8 text-center text-muted-foreground text-sm">
        <div className="container">NEBULA VPN © 2026 · Контакты, оферта и реквизиты — в настройках сайта</div>
      </footer>
    </div>
  );
};

export default Index;