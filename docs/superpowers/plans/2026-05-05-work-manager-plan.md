# 个人工作任务管理平台 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个基于 Next.js + Supabase 的个人工作任务可视化管理平台，支持看板、图表、移动端 PWA。

**Architecture:** Next.js 14 App Router 前端通过 Supabase JS Client 直接操作 PostgreSQL 数据库，无自有后端。TanStack Query 管理服务端状态，Tailwind CSS + shadcn/ui 构建 UI，@hello-pangea/dnd 实现拖拽。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase, TanStack Query v5, @hello-pangea/dnd, Recharts

---

## 文件结构总览

```
WEB/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx                # 仪表盘
│   │   ├── globals.css             # 全局样式
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # 登录页
│   │   │   ├── callback/
│   │   │   │   └── route.ts        # Auth 回调
│   │   │   └── actions.ts          # 登录/注册 server actions
│   │   ├── board/
│   │   │   └── page.tsx            # 看板页
│   │   ├── charts/
│   │   │   └── page.tsx            # 图表页
│   │   ├── settings/
│   │   │   └── page.tsx            # 设置页
│   │   └── api/
│   │       └── export/
│   │           └── route.ts        # 数据导出 API
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── MobileNav.tsx
│   │   ├── dashboard/
│   │   │   ├── TodaySummary.tsx
│   │   │   ├── UpcomingDeadlines.tsx
│   │   │   ├── ProjectProgress.tsx
│   │   │   └── QuickAdd.tsx
│   │   ├── board/
│   │   │   ├── BoardHeader.tsx
│   │   │   ├── BoardColumns.tsx
│   │   │   ├── BoardColumn.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskDrawer.tsx
│   │   ├── charts/
│   │   │   ├── ChartFilters.tsx
│   │   │   ├── StatusPieChart.tsx
│   │   │   ├── PriorityBarChart.tsx
│   │   │   └── WeeklyTrendLine.tsx
│   │   ├── settings/
│   │   │   ├── ProjectManager.tsx
│   │   │   ├── TagManager.tsx
│   │   │   └── DataExport.tsx
│   │   └── shared/
│   │       ├── PriorityBadge.tsx
│   │       ├── StatusBadge.tsx
│   │       ├── TagBadge.tsx
│   │       ├── EmptyState.tsx
│   │       └── Toast.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # 浏览器端 Supabase client
│   │   │   ├── server.ts           # 服务端 Supabase client
│   │   │   └── middleware.ts       # Supabase auth helper
│   │   ├── hooks/
│   │   │   ├── useProjects.ts
│   │   │   ├── useTasks.ts
│   │   │   ├── useTags.ts
│   │   │   └── useAuth.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils.ts
│   ├── providers/
│   │   ├── QueryProvider.tsx
│   │   └── AuthProvider.tsx
│   └── middleware.ts               # Next.js auth middleware
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icon-192.png
│   └── icon-512.png
├── docs/
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── components.json                # shadcn/ui config
├── postcss.config.mjs
├── .env.local.example
└── .gitignore
```

---

### 阶段一：项目脚手架

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `.env.local.example`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd /d/chengxu/KAIFA/WEB
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Expected: 显示 "Success! Created WEB at D:\chengxu\KAIFA\WEB"

- [ ] **Step 2: 创建 .env.local.example**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

- [ ] **Step 3: 验证项目能启动**

```bash
npm run dev
```

Expected: 终端显示 `http://localhost:3000`，浏览器能打开看到 Next.js 默认页面

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: init Next.js project with TypeScript and Tailwind"
```

---

### Task 2: 安装依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装核心依赖**

```bash
npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query @hello-pangea/dnd recharts lucide-react clsx tailwind-merge
```

- [ ] **Step 2: 安装 shadcn/ui CLI 并初始化**

```bash
npx shadcn@latest init -d --style default --base-color zinc
```

Expected: 生成 `components.json`

- [ ] **Step 3: 安装 shadcn 组件**

```bash
npx shadcn@latest add button input label card sheet dialog select popover calendar badge separator drawer toast sonner textarea dropdown-menu --yes
```

- [ ] **Step 4: 安装 dev 依赖**

```bash
npm install -D @types/node
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json components.json
git commit -m "chore: add core dependencies (supabase, tanstack-query, dnd, recharts, shadcn/ui)"
```

---

### Task 3: Supabase 项目与数据库

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: 登录 Supabase 并创建项目**

打开浏览器访问 https://supabase.com/dashboard，注册/登录，点击 "New project"：
- Name: work-manager
- Database Password: 记录到安全的地方
- Region: Northeast Asia (Tokyo) 或 Southeast Asia (Singapore)
- 创建完成后，复制 `Project URL` 和 `anon public key` 到 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

> ⚠️ 需要用户决策：Supabase 项目 URL 和 anon key

- [ ] **Step 2: 创建数据库迁移文件**

```sql
-- supabase/migrations/001_initial_schema.sql

-- 启用 pgcrypto 扩展（用于 UUID 生成）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 项目表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  is_archived BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 任务表
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  position INTEGER DEFAULT 0,
  parent_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 标签表
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  user_id UUID NOT NULL
);

-- 任务-标签关联表
CREATE TABLE task_tags (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);

-- 索引
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);
```

- [ ] **Step 3: 在 Supabase SQL Editor 中执行迁移**

打开 Supabase Dashboard → SQL Editor → New query，粘贴上述 SQL，点击 Run。

Expected: 显示 "Success. No rows returned"

- [ ] **Step 4: 创建 RLS 策略 — projects 表**

```sql
-- 在 Supabase SQL Editor 中执行以下 SQL

-- projects: 用户只能读写自己的项目
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] **Step 5: 创建 RLS 策略 — tasks 表**

```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tasks"
  ON tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (auth.uid() = user_id);
```

- [ ] **Step 6: 创建 RLS 策略 — tags 和 task_tags 表**

```sql
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tags"
  ON tags FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
  ON tags FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
  ON tags FOR DELETE
  USING (auth.uid() = user_id);

ALTER TABLE task_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own task_tags"
  ON task_tags FOR SELECT
  USING (EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can insert own task_tags"
  ON task_tags FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));

CREATE POLICY "Users can delete own task_tags"
  ON task_tags FOR DELETE
  USING (EXISTS (SELECT 1 FROM tasks WHERE tasks.id = task_tags.task_id AND tasks.user_id = auth.uid()));
```

- [ ] **Step 7: 启用 Supabase Auth（邮箱）**

打开 Supabase Dashboard → Authentication → Providers，启用 Email 提供商。不需要启用 "Confirm email"（降低开发复杂度）。

- [ ] **Step 8: Commit**

```bash
git add supabase/migrations/ .env.local.example
git commit -m "feat: add database schema and RLS policies"
```

---

### 阶段二：类型定义与工具层

### Task 4: TypeScript 类型定义

**Files:**
- Create: `src/lib/types/index.ts`

- [ ] **Step 1: 写入类型定义**

```typescript
// src/lib/types/index.ts

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  name: string;
  color: string;
  is_archived: boolean;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  position: number;
  parent_id: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  subtasks?: Task[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  user_id: string;
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: '待处理',
  in_progress: '进行中',
  review: '待审核',
  done: '已完成',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: '#6B7280',
  medium: '#3B82F6',
  high: '#F59E0B',
  urgent: '#EF4444',
};

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types/index.ts
git commit -m "feat: add TypeScript type definitions for Task, Project, Tag"
```

---

### Task 5: 工具函数与 Supabase 客户端

**Files:**
- Create: `src/lib/utils.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`
- Modify: `src/lib/types/index.ts` (re-exported types through utils)

- [ ] **Step 1: 写入工具函数**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: 写入浏览器端 Supabase 客户端**

```typescript
// src/lib/supabase/client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: 写入服务端 Supabase 客户端**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

- [ ] **Step 4: 写入 Supabase 中间件工具**

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value, options)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 未登录且不在登录页，重定向到 /auth/login
  if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // 已登录且在登录页，重定向到首页
  if (user && request.nextUrl.pathname === '/auth/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
```

- [ ] **Step 5: 写入 Next.js 认证中间件**

```typescript
// src/middleware.ts
import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/utils.ts src/lib/supabase/ src/middleware.ts
git commit -m "feat: add Supabase clients and auth middleware"
```

---

### Task 6: Providers 层

**Files:**
- Create: `src/providers/QueryProvider.tsx`, `src/providers/AuthProvider.tsx`

- [ ] **Step 1: 写入 QueryProvider**

```typescript
// src/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

- [ ] **Step 2: 写入 AuthProvider**

```typescript
// src/providers/AuthProvider.tsx
'use client';

import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/providers/
git commit -m "feat: add QueryProvider and AuthProvider context"
```

---

### 阶段三：认证

### Task 7: 登录页

**Files:**
- Create: `src/app/auth/login/page.tsx`, `src/app/auth/actions.ts`, `src/app/auth/callback/route.ts`

- [ ] **Step 1: 写入 Auth Actions（Server Actions）**

```typescript
// src/app/auth/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  redirect('/');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect('/auth/login?message=注册成功，请使用邮箱和密码登录');
}
```

- [ ] **Step 2: 写入 Auth Callback Route**

```typescript
// src/app/auth/callback/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login`);
}
```

- [ ] **Step 3: 写入登录页**

```tsx
// src/app/auth/login/page.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signIn, signUp } from '../actions';
import { useState } from 'react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = isLogin ? await signIn(formData) : await signUp(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">工作任务管理</CardTitle>
          <CardDescription>
            {isLogin ? '登录你的账号' : '创建新账号'}
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少 6 位密码"
                required
                minLength={6}
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full">
              {isLogin ? '登录' : '注册'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm"
              onClick={() => { setIsLogin(!isLogin); setError(null); }}
            >
              {isLogin ? '没有账号？去注册' : '已有账号？去登录'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: 验证登录流程**

```bash
npm run dev
```

Expected: 访问 `http://localhost:3000` 被重定向到 `/auth/login`，能完成注册和登录

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/
git commit -m "feat: add login/register page with email auth"
```

---

### 阶段四：布局框架

### Task 8: AppLayout / Sidebar / Topbar / MobileNav

**Files:**
- Create: `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Topbar.tsx`, `src/components/layout/MobileNav.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: 写入 Sidebar**

```tsx
// src/components/layout/Sidebar.tsx
'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Kanban, PieChart, Settings } from 'lucide-react';
import type { ComponentType } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/board', label: '看板', icon: Kanban },
  { href: '/charts', label: '图表', icon: PieChart },
  { href: '/settings', label: '设置', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn(
      'hidden lg:flex flex-col border-r border-zinc-200 bg-white transition-all duration-300',
      collapsed ? 'w-16' : 'w-56'
    )}>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 2: 写入 Topbar**

```tsx
// src/components/layout/Topbar.tsx
'use client';

import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold text-zinc-900">工作任务管理</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
```

- [ ] **Step 3: 写入 MobileNav**

```tsx
// src/components/layout/MobileNav.tsx
'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Kanban, PieChart, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/board', label: '看板', icon: Kanban },
  { href: '/charts', label: '图表', icon: PieChart },
  { href: '/settings', label: '设置', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200 bg-white">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs font-medium transition-colors',
                isActive ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: 写入 AppLayout**

```tsx
// src/components/layout/AppLayout.tsx
'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useState, type ReactNode } from 'react';

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
```

- [ ] **Step 5: 更新根布局，加入 Providers**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: '工作任务管理',
  description: '个人工作任务可视化管理平台',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx
git commit -m "feat: add AppLayout with sidebar, topbar, mobile nav"
```

---

### Task 9: 页面路由骨架

**Files:**
- Modify: `src/app/page.tsx`, `src/app/board/page.tsx` (create), `src/app/charts/page.tsx` (create), `src/app/settings/page.tsx` (create)

- [ ] **Step 1: 写入仪表盘骨架**

```tsx
// src/app/page.tsx
import { AppLayout } from '@/components/layout/AppLayout';

export default function DashboardPage() {
  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900">仪表盘</h2>
    </AppLayout>
  );
}
```

- [ ] **Step 2: 写入看板骨架**

```tsx
// src/app/board/page.tsx
import { AppLayout } from '@/components/layout/AppLayout';

export default function BoardPage() {
  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900">看板</h2>
    </AppLayout>
  );
}
```

- [ ] **Step 3: 写入图表骨架**

```tsx
// src/app/charts/page.tsx
import { AppLayout } from '@/components/layout/AppLayout';

export default function ChartsPage() {
  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900">图表</h2>
    </AppLayout>
  );
}
```

- [ ] **Step 4: 写入设置骨架**

```tsx
// src/app/settings/page.tsx
import { AppLayout } from '@/components/layout/AppLayout';

export default function SettingsPage() {
  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900">设置</h2>
    </AppLayout>
  );
}
```

- [ ] **Step 5: 运行 dev 验证导航**

```bash
npm run dev
```

Expected: 登录后可看到各页面，侧边栏和底部导航可正常切换路由

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/board/ src/app/charts/ src/app/settings/
git commit -m "feat: add page route skeletons with AppLayout"
```

---

### 阶段五：共享组件

### Task 10: 共享 Badge 与 EmptyState

**Files:**
- Create: `src/components/shared/PriorityBadge.tsx`, `src/components/shared/StatusBadge.tsx`, `src/components/shared/TagBadge.tsx`, `src/components/shared/EmptyState.tsx`

- [ ] **Step 1: 写入 PriorityBadge**

```tsx
// src/components/shared/PriorityBadge.tsx
import { Badge } from '@/components/ui/badge';
import { type TaskPriority, PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/types';

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <Badge
      variant="outline"
      style={{ borderColor: PRIORITY_COLORS[priority], color: PRIORITY_COLORS[priority] }}
    >
      {PRIORITY_LABELS[priority]}
    </Badge>
  );
}
```

- [ ] **Step 2: 写入 StatusBadge**

```tsx
// src/components/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { type TaskStatus, STATUS_LABELS } from '@/lib/types';

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-zinc-100 text-zinc-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge variant="secondary" className={STATUS_STYLES[status]}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
```

- [ ] **Step 3: 写入 TagBadge**

```tsx
// src/components/shared/TagBadge.tsx
import { Badge } from '@/components/ui/badge';

interface TagBadgeProps {
  name: string;
  color: string;
}

export function TagBadge({ name, color }: TagBadgeProps) {
  return (
    <Badge
      variant="outline"
      style={{ borderColor: color, color: color }}
      className="text-xs"
    >
      {name}
    </Badge>
  );
}
```

- [ ] **Step 4: 写入 EmptyState**

```tsx
// src/components/shared/EmptyState.tsx
import { type ComponentType } from 'react';

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="h-12 w-12 text-zinc-300 mb-4" />}
      <h3 className="text-lg font-medium text-zinc-600">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-zinc-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/
git commit -m "feat: add shared badge and empty state components"
```

---

### Task 11: Toast 通知组件

**Files:**
- Create: `src/components/shared/Toast.tsx`
- Note: 使用 sonner（已在 Task 2 安装），这里只需封装工具函数

- [ ] **Step 1: 写入 Toast 工具函数**

```typescript
// src/components/shared/Toast.tsx
'use client';

import { toast } from 'sonner';

export function showSuccess(message: string) {
  toast.success(message);
}

export function showError(message: string) {
  toast.error(message);
}

export function showInfo(message: string) {
  toast.info(message);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/shared/Toast.tsx
git commit -m "feat: add toast notification utility"
```

---

### 阶段六：数据 Hook 层

### Task 12: Supabase 数据 Hooks

**Files:**
- Create: `src/lib/hooks/useProjects.ts`, `src/lib/hooks/useTasks.ts`, `src/lib/hooks/useTags.ts`

- [ ] **Step 1: 写入 useProjects**

```typescript
// src/lib/hooks/useProjects.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';

const supabase = createClient();

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; name?: string; color?: string; is_archived?: boolean }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...input, id: undefined })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
```

- [ ] **Step 2: 写入 useTasks**

```typescript
// src/lib/hooks/useTasks.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Task, TaskStatus } from '@/lib/types';

const supabase = createClient();

export function useTasks(projectId: string | null) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (error) throw error;
      return (data ?? []) as Task[];
    },
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      project_id: string;
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: string;
      due_date?: string;
      position?: number;
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      project_id?: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: string;
      due_date?: string | null;
      position?: number;
    }) => {
      const { id, ...fields } = input;
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', data.project_id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.projectId] });
    },
  });
}
```

- [ ] **Step 3: 写入 useTags**

```typescript
// src/lib/hooks/useTags.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Tag } from '@/lib/types';

const supabase = createClient();

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Tag[];
    },
  });
}

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; name?: string; color?: string }) => {
      const { data, error } = await supabase
        .from('tags')
        .update({ name: input.name, color: input.color })
        .eq('id', input.id)
        .select()
        .single();

      if (error) throw error;
      return data as Tag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/hooks/
git commit -m "feat: add data hooks for projects, tasks, and tags"
```

---

### 阶段七：仪表盘

### Task 13: 仪表盘组件

**Files:**
- Create: `src/components/dashboard/TodaySummary.tsx`, `src/components/dashboard/UpcomingDeadlines.tsx`, `src/components/dashboard/ProjectProgress.tsx`, `src/components/dashboard/QuickAdd.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 写入 TodaySummary**

```tsx
// src/components/dashboard/TodaySummary.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, Clock, AlertCircle, ListTodo } from 'lucide-react';

const supabase = createClient();

export function TodaySummary() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('status, priority, due_date')
        .eq('user_id', user!.id);

      if (error) throw error;

      const tasks = data ?? [];
      const today = new Date().toISOString().split('T')[0];

      return {
        total: tasks.length,
        done: tasks.filter((t) => t.status === 'done').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        urgent: tasks.filter((t) => t.priority === 'urgent').length,
        dueToday: tasks.filter((t) => t.due_date === today).length,
      };
    },
    enabled: !!user,
  });

  if (isLoading || !stats) return null;

  const items = [
    { label: '总任务', value: stats.total, icon: ListTodo, color: 'text-zinc-600' },
    { label: '已完成', value: stats.done, icon: CheckCircle, color: 'text-green-600' },
    { label: '进行中', value: stats.inProgress, icon: Clock, color: 'text-blue-600' },
    { label: '今日到期', value: stats.dueToday, icon: AlertCircle, color: 'text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">{item.label}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-zinc-900">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 写入 UpcomingDeadlines**

```tsx
// src/components/dashboard/UpcomingDeadlines.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { format, isPast, parseISO, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Task } from '@/lib/types';
import Link from 'next/link';

const supabase = createClient();

export function UpcomingDeadlines() {
  const { user } = useAuth();

  const { data: tasks } = useQuery({
    queryKey: ['dashboard', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user!.id)
        .neq('status', 'done')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  if (!tasks?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">即将到期</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.slice(0, 5).map((task) => {
          const dueDate = parseISO(task.due_date!);
          const past = isPast(dueDate) && !isToday(dueDate);
          return (
            <Link
              key={task.id}
              href="/board"
              className="flex items-center justify-between rounded-md px-3 py-2 hover:bg-zinc-50 transition-colors"
            >
              <span className={`text-sm truncate ${past ? 'text-red-600' : 'text-zinc-700'}`}>
                {task.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={task.priority} />
                <span className={`text-xs ${past ? 'text-red-500' : 'text-zinc-400'}`}>
                  {format(dueDate, 'M月d日', { locale: zhCN })}
                </span>
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: 写入 ProjectProgress**

```tsx
// src/components/dashboard/ProjectProgress.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

const supabase = createClient();

export function ProjectProgress() {
  const { user } = useAuth();

  const { data: projects } = useQuery({
    queryKey: ['dashboard', 'progress'],
    queryFn: async () => {
      const { data: projData, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_archived', false);

      if (projErr || !projData) return [];

      const result = await Promise.all(
        projData.map(async (proj) => {
          const { count: total } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', proj.id);
          const { count: done } = await supabase
            .from('tasks')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', proj.id)
            .eq('status', 'done');

          return {
            id: proj.id,
            name: proj.name,
            color: proj.color,
            total: total ?? 0,
            done: done ?? 0,
          };
        })
      );

      return result;
    },
    enabled: !!user,
  });

  if (!projects?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">项目进度</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((proj) => (
          <Link key={proj.id} href="/board" className="block">
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                <span className="text-zinc-700">{proj.name}</span>
              </div>
              <span className="text-zinc-400">
                {proj.done}/{proj.total}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: proj.total > 0 ? `${(proj.done / proj.total) * 100}%` : '0%',
                  backgroundColor: proj.color,
                }}
              />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: 写入 QuickAdd**

```tsx
// src/components/dashboard/QuickAdd.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/lib/hooks/useProjects';
import { useCreateTask } from '@/lib/hooks/useTasks';
import { showSuccess, showError } from '@/components/shared/Toast';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState('');
  const { data: projects } = useProjects();
  const createTask = useCreateTask();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !projectId) return;

    try {
      await createTask.mutateAsync({
        project_id: projectId,
        title: title.trim(),
        status: 'todo',
        position: 0,
      });
      showSuccess('任务已创建');
      setTitle('');
      setOpen(false);
    } catch {
      showError('创建失败，请重试');
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          快速新建
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>快速新建任务</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">任务标题</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>所属项目</Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger>
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={createTask.isPending}>
            {createTask.isPending ? '创建中...' : '创建任务'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: 更新仪表盘页面**

```tsx
// src/app/page.tsx
import { AppLayout } from '@/components/layout/AppLayout';
import { TodaySummary } from '@/components/dashboard/TodaySummary';
import { UpcomingDeadlines } from '@/components/dashboard/UpcomingDeadlines';
import { ProjectProgress } from '@/components/dashboard/ProjectProgress';
import { QuickAdd } from '@/components/dashboard/QuickAdd';

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-900">仪表盘</h2>
        <QuickAdd />
      </div>
      <div className="space-y-6">
        <TodaySummary />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UpcomingDeadlines />
          <ProjectProgress />
        </div>
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 6: 安装 date-fns**

```bash
npm install date-fns
```

- [ ] **Step 7: 验证仪表盘**

```bash
npm run dev
```

Expected: 仪表盘显示统计卡片、即将到期列表、项目进度条；快速新建弹窗可创建任务

- [ ] **Step 8: Commit**

```bash
git add src/components/dashboard/ src/app/page.tsx package.json package-lock.json
git commit -m "feat: add dashboard with summary, deadlines, progress, quick-add"
```

---

### 阶段八：看板（核心功能）

### Task 14: BoardHeader（项目选择 + 搜索 + 筛选）

**Files:**
- Create: `src/components/board/BoardHeader.tsx`

- [ ] **Step 1: 写入 BoardHeader**

```tsx
// src/components/board/BoardHeader.tsx
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useProjects } from '@/lib/hooks/useProjects';
import { Search, FolderKanban } from 'lucide-react';
import type { TaskPriority } from '@/lib/types';

interface BoardHeaderProps {
  selectedProject: string | null;
  onProjectChange: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityFilter: TaskPriority | 'all';
  onPriorityChange: (priority: TaskPriority | 'all') => void;
}

export function BoardHeader({
  selectedProject,
  onProjectChange,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
}: BoardHeaderProps) {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
      <Select value={selectedProject ?? ''} onValueChange={onProjectChange}>
        <SelectTrigger className="w-full sm:w-52">
          <FolderKanban className="h-4 w-4 mr-2 text-zinc-400" />
          <SelectValue placeholder={isLoading ? '加载中...' : '选择项目'} />
        </SelectTrigger>
        <SelectContent>
          {projects?.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1 w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="搜索任务..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select value={priorityFilter} onValueChange={(v) => onPriorityChange(v as TaskPriority | 'all')}>
        <SelectTrigger className="w-full sm:w-28">
          <SelectValue placeholder="优先级" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部</SelectItem>
          <SelectItem value="urgent">紧急</SelectItem>
          <SelectItem value="high">高</SelectItem>
          <SelectItem value="medium">中</SelectItem>
          <SelectItem value="low">低</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/BoardHeader.tsx
git commit -m "feat: add BoardHeader with project selector, search, and priority filter"
```

---

### Task 15: TaskCard 组件

**Files:**
- Create: `src/components/board/TaskCard.tsx`

- [ ] **Step 1: 写入 TaskCard**

```tsx
// src/components/board/TaskCard.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PriorityBadge } from '@/components/shared/PriorityBadge';
import { TagBadge } from '@/components/shared/TagBadge';
import { type Task } from '@/lib/types';
import { GripVertical, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

export function TaskCard({ task, isDragging, onClick }: TaskCardProps) {
  return (
    <Card
      className={`group cursor-pointer hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg rotate-2' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 mt-0.5 text-zinc-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{task.title}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.tags?.map((tag) => (
            <TagBadge key={tag.id} name={tag.name} color={tag.color} />
          ))}
        </div>

        {task.due_date && (
          <div className="flex items-center gap-1 text-xs text-zinc-400">
            <Calendar className="h-3 w-3" />
            <span>{format(parseISO(task.due_date), 'M月d日', { locale: zhCN })}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/TaskCard.tsx
git commit -m "feat: add TaskCard component with priority, tags, and due date"
```

---

### Task 16: BoardColumn 组件

**Files:**
- Create: `src/components/board/BoardColumn.tsx`

- [ ] **Step 1: 写入 BoardColumn**

```tsx
// src/components/board/BoardColumn.tsx
'use client';

import { type Task, type TaskStatus, STATUS_LABELS } from '@/lib/types';
import { TaskCard } from './TaskCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Inbox } from 'lucide-react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import type { DroppableProvided } from '@hello-pangea/dnd';

interface BoardColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: 'border-t-zinc-400',
  in_progress: 'border-t-blue-400',
  review: 'border-t-yellow-400',
  done: 'border-t-green-400',
};

export function BoardColumn({ status, tasks, onTaskClick }: BoardColumnProps) {
  return (
    <div className="flex flex-col w-72 shrink-0">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-zinc-600">{STATUS_LABELS[status]}</h3>
        <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={status}>
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 rounded-lg border-t-2 ${COLUMN_COLORS[status]} bg-zinc-100/50 p-2 space-y-2 min-h-[200px] transition-colors`}
          >
            {tasks.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="暂无任务"
                description="新建任务将在此处显示"
              />
            )}
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskCard
                      task={task}
                      isDragging={snapshot.isDragging}
                      onClick={() => onTaskClick(task)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/BoardColumn.tsx
git commit -m "feat: add BoardColumn with drag-and-drop support"
```

---

### Task 17: BoardColumns 容器

**Files:**
- Create: `src/components/board/BoardColumns.tsx`

- [ ] **Step 1: 写入 BoardColumns**

```tsx
// src/components/board/BoardColumns.tsx
'use client';

import { type Task, type TaskStatus, STATUS_ORDER } from '@/lib/types';
import { BoardColumn } from './BoardColumn';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { useUpdateTask } from '@/lib/hooks/useTasks';
import { showError } from '@/components/shared/Toast';

interface BoardColumnsProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function BoardColumns({ tasks, onTaskClick }: BoardColumnsProps) {
  const updateTask = useUpdateTask();

  function getColumnTasks(status: TaskStatus): Task[] {
    return tasks
      .filter((t) => t.status === status)
      .sort((a, b) => a.position - b.position);
  }

  async function handleDragEnd(result: DropResult) {
    const { draggableId, source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    const columnTasks = getColumnTasks(newStatus);

    // 计算新位置
    let newPosition: number;
    if (columnTasks.length === 0) {
      newPosition = 0;
    } else if (destination.index === 0) {
      newPosition = columnTasks[0].position - 1000;
    } else if (destination.index >= columnTasks.length) {
      newPosition = columnTasks[columnTasks.length - 1].position + 1000;
    } else {
      const before = columnTasks[destination.index - 1]?.position ?? 0;
      const after = columnTasks[destination.index]?.position ?? 0;
      newPosition = Math.floor((before + after) / 2);
    }

    // 乐观更新 + 持久化
    try {
      await updateTask.mutateAsync({
        id: draggableId,
        status: newStatus,
        position: newPosition,
      });
    } catch {
      showError('操作失败，已回滚');
    }
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUS_ORDER.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            tasks={getColumnTasks(status)}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/BoardColumns.tsx
git commit -m "feat: add BoardColumns container with drag-and-drop logic"
```

---

### Task 18: TaskDrawer（任务详情/编辑面板）

**Files:**
- Create: `src/components/board/TaskDrawer.tsx`

- [ ] **Step 1: 写入 TaskDrawer**

```tsx
// src/components/board/TaskDrawer.tsx
'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Task, type TaskStatus, type TaskPriority, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types';
import { useUpdateTask, useDeleteTask } from '@/lib/hooks/useTasks';
import { showSuccess, showError } from '@/components/shared/Toast';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface TaskDrawerProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export function TaskDrawer({ task, open, onClose }: TaskDrawerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_date ?? '');
    }
  }, [task]);

  if (!task) return null;

  async function handleSave() {
    if (!title.trim()) return;
    try {
      await updateTask.mutateAsync({
        id: task!.id,
        title: title.trim(),
        description: description.trim() || '',
        status,
        priority,
        due_date: dueDate || null,
      });
      showSuccess('已保存');
    } catch {
      showError('保存失败');
    }
  }

  async function handleDelete() {
    try {
      await deleteTask.mutateAsync({ id: task!.id, projectId: task!.project_id });
      showSuccess('已删除');
      onClose();
    } catch {
      showError('删除失败');
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg">任务详情</SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* 标题 */}
          <div className="space-y-2">
            <Label htmlFor="task-title">标题</Label>
            <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* 描述 */}
          <div className="space-y-2">
            <Label htmlFor="task-desc">描述</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="添加描述..."
            />
          </div>

          {/* 状态 */}
          <div className="space-y-2">
            <Label>状态</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 优先级 */}
          <div className="space-y-2">
            <Label>优先级</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 截止日期 */}
          <div className="space-y-2">
            <Label htmlFor="task-due">截止日期</Label>
            <Input id="task-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={updateTask.isPending}>
              {updateTask.isPending ? '保存中...' : '保存'}
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete} disabled={deleteTask.isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* 元信息 */}
          <div className="text-xs text-zinc-400 space-y-1 pt-4 border-t">
            <p>创建时间: {new Date(task.created_at).toLocaleString('zh-CN')}</p>
            <p>更新时间: {new Date(task.updated_at).toLocaleString('zh-CN')}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/board/TaskDrawer.tsx
git commit -m "feat: add TaskDrawer component for task editing"
```

---

### Task 19: 组装看板页面

**Files:**
- Modify: `src/app/board/page.tsx`

- [ ] **Step 1: 更新看板页面**

```tsx
// src/app/board/page.tsx
'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { BoardHeader } from '@/components/board/BoardHeader';
import { BoardColumns } from '@/components/board/BoardColumns';
import { TaskDrawer } from '@/components/board/TaskDrawer';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTasks, useCreateTask } from '@/lib/hooks/useTasks';
import { useProjects } from '@/lib/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { type Task, type TaskPriority } from '@/lib/types';
import { showSuccess, showError } from '@/components/shared/Toast';
import { FolderKanban, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function BoardPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: projects } = useProjects();
  const { data: tasks = [], isLoading } = useTasks(selectedProject);
  const createTask = useCreateTask();

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [tasks, searchQuery, priorityFilter]);

  async function handleQuickCreate() {
    if (!selectedProject) return;
    const title = window.prompt('输入任务标题:');
    if (!title?.trim()) return;

    try {
      await createTask.mutateAsync({
        project_id: selectedProject,
        title: title.trim(),
        status: 'todo',
        position: 0,
      });
      showSuccess('任务已创建');
    } catch {
      showError('创建失败');
    }
  }

  return (
    <AppLayout>
      <BoardHeader
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
      />

      {!selectedProject ? (
        <EmptyState
          icon={FolderKanban}
          title="选择一个项目开始"
          description="从上方下拉菜单中选择项目，或去设置页创建一个"
        />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-zinc-400">加载中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <Button size="sm" variant="outline" className="gap-1" onClick={handleQuickCreate}>
            <Plus className="h-4 w-4" />
            新建任务
          </Button>
          <BoardColumns tasks={filteredTasks} onTaskClick={setEditingTask} />
        </div>
      )}

      <TaskDrawer
        task={editingTask}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
      />
    </AppLayout>
  );
}
```

- [ ] **Step 2: 运行看板验证**

```bash
npm run dev
```

Expected:
- 选择一个项目后，显示 4 列看板
- 点击"新建任务"可快速创建
- 拖拽卡片可在列之间和列内移动
- 点击卡片打开侧滑编辑面板
- 搜索和优先级过滤正常工作

- [ ] **Step 3: Commit**

```bash
git add src/app/board/page.tsx
git commit -m "feat: assemble board page with drag-and-drop, search, and task editing"
```

---

### 阶段九：图表

### Task 20: 图表页面

**Files:**
- Create: `src/components/charts/ChartFilters.tsx`, `src/components/charts/StatusPieChart.tsx`, `src/components/charts/PriorityBarChart.tsx`, `src/components/charts/WeeklyTrendLine.tsx`
- Modify: `src/app/charts/page.tsx`

- [ ] **Step 1: 写入 ChartFilters**

```tsx
// src/components/charts/ChartFilters.tsx
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjects } from '@/lib/hooks/useProjects';

interface ChartFiltersProps {
  selectedProject: string;
  onProjectChange: (id: string) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export function ChartFilters({
  selectedProject,
  onProjectChange,
  timeRange,
  onTimeRangeChange,
}: ChartFiltersProps) {
  const { data: projects } = useProjects();

  return (
    <div className="flex items-center gap-3 mb-6">
      <Select value={selectedProject} onValueChange={onProjectChange}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="全部项目" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部项目</SelectItem>
          {projects?.map((p) => (
            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={timeRange} onValueChange={onTimeRangeChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="时间范围" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">最近 7 天</SelectItem>
          <SelectItem value="30">最近 30 天</SelectItem>
          <SelectItem value="90">最近 90 天</SelectItem>
          <SelectItem value="all">全部</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 2: 写入 StatusPieChart**

```tsx
// src/components/charts/StatusPieChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Task, STATUS_LABELS, type TaskStatus, STATUS_ORDER } from '@/lib/types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: '#A1A1AA',
  in_progress: '#3B82F6',
  review: '#F59E0B',
  done: '#22C55E',
};

interface StatusPieChartProps {
  tasks: Task[];
}

export function StatusPieChart({ tasks }: StatusPieChartProps) {
  const data = STATUS_ORDER.map((status) => ({
    name: STATUS_LABELS[status],
    value: tasks.filter((t) => t.status === status).length,
    color: STATUS_COLORS[status],
  })).filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-base">任务状态分布</CardTitle></CardHeader>
        <CardContent className="text-center text-zinc-400 py-8">暂无数据</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">任务状态分布</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}`}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: 写入 PriorityBarChart**

```tsx
// src/components/charts/PriorityBarChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Task, PRIORITY_LABELS, PRIORITY_COLORS, type TaskPriority } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PRIORITY_ORDER: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];

interface PriorityBarChartProps {
  tasks: Task[];
}

export function PriorityBarChart({ tasks }: PriorityBarChartProps) {
  const data = PRIORITY_ORDER.map((p) => ({
    name: PRIORITY_LABELS[p],
    value: tasks.filter((t) => t.priority === p).length,
    fill: PRIORITY_COLORS[p],
  }));

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">优先级分布</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: 写入 WeeklyTrendLine**

```tsx
// src/components/charts/WeeklyTrendLine.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Task } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays, parseISO, isWithinInterval } from 'date-fns';

interface WeeklyTrendLineProps {
  tasks: Task[];
  days: number;
}

export function WeeklyTrendLine({ tasks, days }: WeeklyTrendLineProps) {
  const today = new Date();
  const data = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date: format(date, 'M/d'),
      created: tasks.filter((t) => format(parseISO(t.created_at), 'yyyy-MM-dd') === dateStr).length,
      completed: tasks.filter(
        (t) => t.status === 'done' && format(parseISO(t.updated_at), 'yyyy-MM-dd') === dateStr
      ).length,
    };
  });

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">趋势图（近 {days} 天）</CardTitle></CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" fontSize={12} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="created" stroke="#3B82F6" name="新建" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="completed" stroke="#22C55E" name="完成" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: 更新图表页面**

```tsx
// src/app/charts/page.tsx
'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { ChartFilters } from '@/components/charts/ChartFilters';
import { StatusPieChart } from '@/components/charts/StatusPieChart';
import { PriorityBarChart } from '@/components/charts/PriorityBarChart';
import { WeeklyTrendLine } from '@/components/charts/WeeklyTrendLine';
import { useAuth } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { type Task } from '@/lib/types';
import { useState } from 'react';

const supabase = createClient();

export default function ChartsPage() {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState('all');
  const [timeRange, setTimeRange] = useState('30');

  const { data: tasks = [] } = useQuery({
    queryKey: ['charts', 'tasks', selectedProject],
    queryFn: async () => {
      let query = supabase.from('tasks').select('*').eq('user_id', user!.id);
      if (selectedProject !== 'all') {
        query = query.eq('project_id', selectedProject);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!user,
  });

  const days = timeRange === 'all' ? 90 : parseInt(timeRange);

  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">图表分析</h2>
      <ChartFilters
        selectedProject={selectedProject}
        onProjectChange={setSelectedProject}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPieChart tasks={tasks} />
        <PriorityBarChart tasks={tasks} />
      </div>
      <div className="mt-6">
        <WeeklyTrendLine tasks={tasks} days={days} />
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 6: 验证图表**

```bash
npm run dev
```

Expected: 图表页显示饼图、柱状图、趋势折线图，可通过筛选条件切换数据范围

- [ ] **Step 7: Commit**

```bash
git add src/components/charts/ src/app/charts/page.tsx
git commit -m "feat: add charts page with pie, bar, and trend line charts"
```

---

### 阶段十：设置

### Task 21: 设置页面（项目管理 + 标签管理 + 数据导出）

**Files:**
- Create: `src/components/settings/ProjectManager.tsx`, `src/components/settings/TagManager.tsx`, `src/components/settings/DataExport.tsx`, `src/app/api/export/route.ts`
- Modify: `src/app/settings/page.tsx`

- [ ] **Step 1: 写入 ProjectManager**

```tsx
// src/components/settings/ProjectManager.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '@/lib/hooks/useProjects';
import { showSuccess, showError } from '@/components/shared/Toast';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export function ProjectManager() {
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [newName, setNewName] = useState('');

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createProject.mutateAsync({
        name: newName.trim(),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
      setNewName('');
      showSuccess('项目已创建');
    } catch {
      showError('创建失败');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('确定删除此项目？所有关联任务将被删除。')) return;
    try {
      await deleteProject.mutateAsync(id);
      showSuccess('已删除');
    } catch {
      showError('删除失败');
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">项目管理</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="新项目名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button size="icon" onClick={handleCreate} disabled={createProject.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          {projects?.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm">{p.name}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: 写入 TagManager**

```tsx
// src/components/settings/TagManager.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTags, useCreateTag, useDeleteTag } from '@/lib/hooks/useTags';
import { showSuccess, showError } from '@/components/shared/Toast';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const TAG_COLORS = ['#6B7280', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function TagManager() {
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [newName, setNewName] = useState('');

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      await createTag.mutateAsync({
        name: newName.trim(),
        color: TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
      });
      setNewName('');
      showSuccess('标签已创建');
    } catch {
      showError('创建失败');
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTag.mutateAsync(id);
      showSuccess('已删除');
    } catch {
      showError('删除失败');
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">标签管理</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="新标签名称"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button size="icon" onClick={handleCreate} disabled={createTag.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags?.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
              style={{ borderColor: t.color, color: t.color }}
            >
              {t.name}
              <button onClick={() => handleDelete(t.id)} className="hover:opacity-70">
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: 写入 DataExport 和数据导出 API**

```tsx
// src/components/settings/DataExport.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { showSuccess, showError } from '@/components/shared/Toast';

export function DataExport() {
  async function handleExport(format: 'json' | 'csv') {
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error();

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess('导出成功');
    } catch {
      showError('导出失败');
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle className="text-base">数据导出</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-zinc-500">将所有任务和项目数据导出为文件</p>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => handleExport('json')}>
            <Download className="h-4 w-4" />
            导出 JSON
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4" />
            导出 CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: 写入导出 API 路由**

```typescript
// src/app/api/export/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'json';
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id);

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id);

  if (format === 'csv') {
    const headers = 'id,title,description,status,priority,due_date,project_id,created_at\n';
    const rows = (tasks ?? []).map((t) =>
      `"${t.id}","${t.title}","${t.description ?? ''}","${t.status}","${t.priority}","${t.due_date ?? ''}","${t.project_id}","${t.created_at}"`
    ).join('\n');
    return new NextResponse(headers + rows, {
      headers: { 'Content-Type': 'text/csv' },
    });
  }

  return NextResponse.json({ tasks, projects });
}
```

- [ ] **Step 5: 更新设置页面**

```tsx
// src/app/settings/page.tsx
import { AppLayout } from '@/components/layout/AppLayout';
import { ProjectManager } from '@/components/settings/ProjectManager';
import { TagManager } from '@/components/settings/TagManager';
import { DataExport } from '@/components/settings/DataExport';

export default function SettingsPage() {
  return (
    <AppLayout>
      <h2 className="text-2xl font-bold text-zinc-900 mb-6">设置</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectManager />
        <TagManager />
      </div>
      <div className="mt-6">
        <DataExport />
      </div>
    </AppLayout>
  );
}
```

- [ ] **Step 6: 验证设置页**

```bash
npm run dev
```

Expected: 设置页可创建/删除项目和标签，可导出 JSON/CSV 文件

- [ ] **Step 7: Commit**

```bash
git add src/components/settings/ src/app/settings/page.tsx src/app/api/
git commit -m "feat: add settings page with project/tag management and data export"
```

---

### 阶段十一：移动端适配与 PWA

### Task 22: 响应式布局完善

**Files:**
- Modify: `src/components/layout/AppLayout.tsx`, `src/components/layout/Sidebar.tsx`, `src/app/board/page.tsx`, `src/app/charts/page.tsx`, `src/app/settings/page.tsx`

- [ ] **Step 1: 在 AppLayout 中添加侧边栏移动端抽屉**

```tsx
// src/components/layout/AppLayout.tsx (完整替换)
'use client';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { useState, type ReactNode } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50">
      {/* Desktop sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Mobile sidebar sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-56 p-0">
          <Sidebar collapsed={false} onToggle={() => {}} />
        </SheetContent>
      </Sheet>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-3 lg:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
```

Note: 更新 Sidebar 组件移除内部的 `hidden lg:flex`（因为 mobile sheet 中也需要显示）

- [ ] **Step 2: 更新 Sidebar 组件 — 移除 lg:hidden 限制**

```tsx
// src/components/layout/Sidebar.tsx
// 将 className 中的 'hidden lg:flex' 改为 'flex'
// 只改这一行：
//   className={cn(
//     'flex flex-col border-r border-zinc-200 bg-white transition-all duration-300',
//     collapsed ? 'w-16' : 'w-56'
//   )}
```

- [ ] **Step 3: 看板页移动端适配**

在 `src/app/board/page.tsx` 中，将 `BoardColumns` 的水平滚动看板改为移动端纵向折叠：

在 BoardColumns 中不需要改（`overflow-x-auto` 已处理水平滚动），手机端只需在全局 CSS 中确保列宽合理。

但实际上现有的 `w-72` 已经可以使手机端通过横向滚动查看所有列。PWA 部分将确保 `viewport` 正确。

当前实现已经通过 Tailwind 响应式类和 `overflow-x-auto` 处理了绝大多数情况。无需额外修改。

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/AppLayout.tsx src/components/layout/Sidebar.tsx
git commit -m "feat: add mobile sidebar sheet and responsive layout improvements"
```

---

### Task 23: PWA 支持

**Files:**
- Create: `public/manifest.json`, `public/sw.js`, `public/icon-192.png`, `public/icon-512.png`
- Modify: `src/app/layout.tsx`, `next.config.ts`

- [ ] **Step 1: 创建 manifest.json**

```json
// public/manifest.json
{
  "name": "工作任务管理",
  "short_name": "任务管理",
  "description": "个人工作任务可视化管理平台",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fafafa",
  "theme_color": "#18181b",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 2: 创建 Service Worker**

```javascript
// public/sw.js
const CACHE_NAME = 'work-manager-v1';

const STATIC_ASSETS = [
  '/',
  '/board',
  '/charts',
  '/settings',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Network-first for API and Supabase calls
  if (event.request.url.includes('supabase.co') || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
```

- [ ] **Step 3: 生成 PWA 图标**

由于无法用代码生成图片，用一个简单的 SVG 转 PNG 方案——先创建一个占位的 PNG 图标，或使用 Next.js metadata 中的图标生成。

作为简化方案，在 `src/app/layout.tsx` 的 metadata 中添加 icons：

```tsx
// 在 src/app/layout.tsx 的 metadata 中添加：
export const metadata: Metadata = {
  title: '工作任务管理',
  description: '个人工作任务可视化管理平台',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '任务管理',
  },
};
```

对于图标文件，使用 Node.js 脚本生成简单的 placeholder：

```bash
# 创建一个简单的占位图标（运行项目后替换为实际图标）
# 直接在 public 目录放置 192x192 和 512x512 的单色 PNG
```

注意：实际部署前需要替换为真实图标。暂时使用占位文件。

- [ ] **Step 4: 创建占位图标脚本**

在项目根目录创建一个 Node 脚本来生成占位 PNG：

先用简单方式绕过——不生成实际图片，部署前手动替换。如果是在本地测试，PWA "安装"按钮在 localhost 不会出现（需要 HTTPS），所以图标暂不影响开发。

- [ ] **Step 5: 更新 next.config.ts 确保 PWA 头正确**

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 6: 注册 Service Worker**

在 `src/app/layout.tsx` 中添加一个客户端脚本来注册 SW。由于 layout 是服务端组件，我们通过 script 标签方式：

```tsx
// 在 </body> 前添加：
// <script dangerouslySetInnerHTML={{
//   __html: `
//     if ('serviceWorker' in navigator) {
//       window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js');
//       });
//     }
//   `
// }} />
```

将实际的脚本注入放到一个客户端组件中：

```tsx
// src/components/shared/PwaRegister.tsx
'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return null;
}
```

然后在 layout.tsx 中引入 `<PwaRegister />`。

- [ ] **Step 7: 更新 layout.tsx**

最终的 `src/app/layout.tsx`：

```tsx
import type { Metadata } from 'next';
import { AuthProvider } from '@/providers/AuthProvider';
import { QueryProvider } from '@/providers/QueryProvider';
import { PwaRegister } from '@/components/shared/PwaRegister';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: '工作任务管理',
  description: '个人工作任务可视化管理平台',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '任务管理',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <PwaRegister />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add public/ src/components/shared/PwaRegister.tsx src/app/layout.tsx next.config.ts
git commit -m "feat: add PWA support with manifest, service worker, and mobile icons"
```

---

### 阶段十二：部署

### Task 24: Vercel 部署

- [ ] **Step 1: 推送代码到 GitHub**

在 GitHub 上创建新仓库 `work-manager`，然后：

```bash
cd /d/chengxu/KAIFA/WEB
git remote add origin https://github.com/你的用户名/work-manager.git
git push -u origin master
```

> ⚠️ 需要用户决策：GitHub 用户名和仓库名

- [ ] **Step 2: 在 Vercel 中导入项目**

打开 https://vercel.com，登录 GitHub 账号：
1. 点击 "New Project"
2. 选择 `work-manager` 仓库
3. 框架自动检测为 Next.js
4. 在 Environment Variables 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 Supabase anon key
5. 点击 Deploy

Expected: 部署成功后，Vercel 提供一个 `https://work-manager.vercel.app` 域名。

- [ ] **Step 3: 验证线上功能**

打开 Vercel 提供的 URL，验证：登录、看板拖拽、图表、设置、PWA 安装。

- [ ] **Step 4: 手机上测试**

用手机浏览器打开 Vercel URL，验证响应式布局和 PWA"添加到主屏幕"功能。

- [ ] **Step 5: Commit（如有配置变更）**

```bash
git add -A
git commit -m "chore: final deployment configuration"
git push
```

---

## 附：本地开发运行

```bash
# 安装依赖
npm install

# 复制环境变量（需要填写 Supabase 信息）
cp .env.local.example .env.local

# 启动开发服务器
npm run dev
# → http://localhost:3000

# 构建生产版本
npm run build
npm start
```

---

## 附：开发节奏建议

按阶段顺序开发，每个阶段完成并验证后再进入下一阶段：

| 阶段 | 内容 | 预计耗时 |
|---|---|---|
| 一 | 项目脚手架 + 依赖 | 一次性 |
| 二 | 类型 + Supabase 客户端 | 一次性 |
| 三 | 认证（登录页） | 一次性 |
| 四 | 布局框架 | 一次性 |
| 五 | 共享组件 | 一次性 |
| 六 | 数据 Hooks | 一次性 |
| 七 | 仪表盘 | 需数据库有数据 |
| 八 | 看板（核心功能） | 最复杂，工时最长 |
| 九 | 图表 | 依赖有任务数据 |
| 十 | 设置 | 独立模块 |
| 十一 | 移动端 + PWA | 收尾 |
| 十二 | 部署 | 一次性 |
