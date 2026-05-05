# 个人工作任务管理平台 — 设计文档

## 概述

一个综合性的个人工作任务可视化管理平台，支持看板、图表、时间线等多种视图，纯个人使用，部署在 Vercel + Supabase 云端。

---

## 1. 总体架构

```
┌─────────────────────────────────────────┐
│  Vercel (前端托管)                        │
│  ┌───────────────────────────────────┐   │
│  │  Next.js App Router              │   │
│  │  ├─ 看板视图  ├─ 图表视图        │   │
│  │  ├─ 时间线    ├─ 任务管理        │   │
│  │  └─ 设置      └─ 数据导出/导入   │   │
│  │      ↕ Supabase JS Client        │   │
│  └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
            ↕ HTTPS
┌─────────────────────────────────────────┐
│  Supabase (BaaS)                         │
│  ├─ PostgreSQL 数据库                    │
│  ├─ Auth 认证邮箱登录                     │
│  └─ Row Level Security 数据隔离          │
└─────────────────────────────────────────┘
```

### 技术选型

| 层 | 选型 | 原因 |
|---|---|---|
| 框架 | Next.js 14+ App Router + TypeScript | Vercel 原生支持 |
| 样式 | Tailwind CSS + shadcn/ui | 组件复用高，风格统一 |
| 拖拽 | @hello-pangea/dnd | 看板卡片拖拽 |
| 图表 | Recharts | React 原生，声明式 API |
| 数据请求 | TanStack Query v5 | 乐观更新、缓存、离线支持 |
| 数据库 | Supabase PostgreSQL | 免费 500MB，自带 API + RLS |
| 认证 | Supabase Auth | 邮箱密码登录 |
| 部署 | Vercel Hobby | 免费，自动 CI/CD |
| PWA | next-pwa / Service Worker | 桌面快捷启动、离线可用 |

---

## 2. 数据模型

### 表结构

**projects（项目）**

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | |
| name | text NOT NULL | 项目名称 |
| color | text | 十六进制色值，如 #3B82F6 |
| is_archived | boolean | 是否归档，默认 false |
| user_id | UUID NOT NULL | 归属用户 |
| created_at | timestamptz | 默认 now() |

**tasks（任务）**

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | |
| project_id | UUID FK → projects.id | 所属项目 |
| title | text NOT NULL | 任务标题 |
| description | text | 详细描述 |
| status | text NOT NULL | todo / in_progress / review / done |
| priority | text | low / medium / high / urgent |
| due_date | date | 截止日期 |
| position | integer | 排序位置 |
| parent_id | UUID FK → tasks.id | 父任务（子任务一层嵌套） |
| user_id | UUID NOT NULL | 归属用户 |
| created_at | timestamptz | 默认 now() |
| updated_at | timestamptz | 默认 now() |

**tags（标签）**

| 字段 | 类型 | 说明 |
|---|---|---|
| id | UUID PK | |
| name | text NOT NULL | 标签名 |
| color | text | 标签颜色 |
| user_id | UUID NOT NULL | 归属用户 |

**task_tags（任务-标签关联）**

| 字段 | 类型 | 说明 |
|---|---|---|
| task_id | UUID FK → tasks.id | |
| tag_id | UUID FK → tags.id | |
| PRIMARY KEY (task_id, tag_id) | | |

**dependencies（任务依赖）— 预留，首版不实现**

| 字段 | 类型 | 说明 |
|---|---|---|
| task_id | UUID FK → tasks.id | |
| depends_on | UUID FK → tasks.id | |

### 设计原则

- 所有表包含 `user_id`，配合 Supabase RLS 实现数据隔离
- 子任务仅一层嵌套（`parent_id` 自引用），避免无限递归
- `created_at` / `updated_at` 使用数据库默认值
- 状态流转：`todo → in_progress → review → done`

---

## 3. 页面路由与导航

### 路由表

| 路由 | 页面 | 说明 |
|---|---|---|
| `/login` | 登录页 | Supabase Auth 邮箱登录 |
| `/` | 仪表盘 | 今日概览、项目进度、快速新建 |
| `/board` | 看板视图 | 可切换项目，列 = 状态，卡片可拖拽 |
| `/charts` | 图表分析 | 饼图/柱状图/趋势图 |
| `/timeline` | 时间线 | 甘特图/日历视图 |
| `/settings` | 设置 | 项目管理、标签管理、数据导出 |

### 布局

- **桌面端**：左侧固定侧边栏（可折叠为图标模式）+ 右侧内容区
- **移动端**：底部 Tab 导航 + 顶栏右侧快捷新建按钮
- **认证中间件**：未登录重定向到 `/login`
- **默认路由**：登录后进入仪表盘 `/`

---

## 4. 组件树

### 页面级组件

```
AppLayout
├── Topbar (Logo + UserMenu)
├── Sidebar (可折叠，NavItem × 5 + ProjectSwitcher)
└── PageContent
    ├── [仪表盘]
    │   ├── TodaySummary
    │   ├── UpcomingDeadlines
    │   ├── ProjectProgress
    │   └── QuickAdd
    ├── [看板]
    │   ├── BoardHeader (项目选择 + 筛选 + 搜索)
    │   ├── BoardColumns → BoardColumn × 4 → TaskCard × N
    │   └── TaskDrawer (侧滑编辑面板)
    ├── [图表]
    │   ├── ChartFilters
    │   ├── StatusPieChart / PriorityBarChart / WeeklyTrendLine / ProjectHeatmap
    │   └── EmptyChartState
    ├── [时间线]
    │   ├── TimelineHeader (月份导航)
    │   ├── GanttChart → GanttBar × N (可拖拽)
    │   └── CalendarHeatmap
    └── [设置]
        ├── ProjectManager
        ├── TagManager
        └── DataExport
```

### 共享组件（复用）

- `TaskCard` — 看板、时间线、搜索结果统一使用
- `TaskDrawer` — 侧滑面板，覆盖查看 + 编辑
- `PriorityBadge` / `StatusBadge` / `TagBadge` — 小标签
- `EmptyState` — 无数据时占位提示

### 状态管理

- React Context + useReducer（不引入 Redux/Zustand）
- TanStack Query 管理服务端状态
- TaskDrawer 的开关状态用 Context 共享

---

## 5. 数据流

```
用户操作 → TanStack Query (useMutation)
         → Supabase JS Client
         → Supabase REST API
         → PostgreSQL + RLS 校验
         → 返回结果
         → TanStack Query 自动刷新缓存 (useQuery)
         → UI 更新
```

- **乐观更新**：看板拖拽立即更新 UI，失败回滚
- **缓存策略**：仪表盘 staleTime 2 分钟，看板实时刷新
- **认证流**：`/login` → Supabase Auth → session token → 中间件检查 → 所有请求自动带 token

---

## 6. 异常处理

| 场景 | 处理方式 |
|---|---|
| 网络断开 | React Query `isOffline` 检测，顶部显示横幅，操作排入离线队列 |
| 请求失败 | Toast 通知，卡片/列表回滚到操作前状态 |
| 数据冲突 | `updated_at` 乐观锁，冲突时提示"数据已被修改" |
| 空状态 | 每个列表/看板列提供 EmptyState 占位引导 |
| 超大数据量 | 看板列分页（每列 50 张），图表聚合查询 |

---

## 7. 移动端适配 & PWA

### 响应式断点

| 断点 | 布局 |
|---|---|
| ≥ 1024px（桌面） | 完整侧边栏 + 多列看板 |
| 768-1023px（平板） | 折叠侧边栏为图标 / 看板两列滚动 |
| < 768px（手机） | 底部 Tab 导航 + 看板单列纵向折叠区块 |

### PWA 特性

| 特性 | 说明 |
|---|---|
| 桌面图标 | manifest.json 定义应用名、图标（192px/512px） |
| 离线可用 | Service Worker 缓存静态资源 + 最近访问数据 |
| 全屏体验 | `display: standalone`，去掉浏览器地址栏 |
| 启动画面 | iOS splash screen meta 标签 |
| 推送通知 | 预留，首版不做 |

---

## 8. 版本规划

### v1.0（首版）

- 认证：邮箱登录/注册
- 看板：项目切换、四列拖拽、任务 CRUD、筛选/搜索
- 仪表盘：今日概览、即将到期
- 图表：状态饼图、优先级柱状图
- 设置：项目管理、标签管理
- 移动端适配 + PWA
- 数据导出（JSON/CSV）

### v1.1（后续）

- 时间线甘特图视图
- 子任务支持
- 任务依赖关系
- 日历热力图
- 数据导入（JSON/CSV）

### v2.0（远期）

- 推送通知提醒
- AI 辅助（任务分解、优先级建议）
- 工作日报/周报自动生成
