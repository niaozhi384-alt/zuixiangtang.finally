# 醉乡堂 · Clash of Clans 部落官网

醉月频中圣，迷花不事君。五湖四海皆兄弟，醉乡堂里认神州。

一个优雅、轻量的部落官网，包含部落介绍、每日一言、联赛报名、首领后台与
Excel 导出。可直接部署到 GitHub + Vercel，数据存放在免费线上数据库
Supabase 中。

## 功能一览

- **部落介绍**：部落活动、晋升规则、奖励机制、职位增幅、联赛纪律等。
- **每日一言**：每天自动抓取一句「一言」展示在首页，并以数据库缓存，
  每天只请求一次外部接口，接口异常时自动使用内置古典名句兜底。
- **联赛报名**：成员输入游戏名称，选择「报名参加 / 暂不参加」即可提交；
  同名重复提交自动更新原记录；公开页面仅显示已报名人数，完整名单只有首领登录后才能看到。
- **报名时间**：首领可在后台设置报名的开始 / 结束时间（北京时间），
  未开始或已结束时段成员无法提交。
- **游戏下载**：首页提供部落冲突国际服最新安装包下载入口（clashpost.com）。
- **部落介绍在线编辑**：首领登录后台可直接修改首页「部落介绍」内容，
  保存后即时生效；留空则恢复默认版面。
- **匿名留言板**：访客可匿名留言，内容仅首领可见；常见骂人词汇自动屏蔽。
- **首领后台**：首领凭用户名与密码登录后，可查看所有成员的报名情况
  （含不报名者）、统计人数、删除记录，并一键导出 Excel 表格。
- **报名安全**：后台接口需要登录会话；登录失败限流；会话为签名
  httpOnly Cookie，有效期 12 小时。

## 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Next.js 15（App Router） | Vercel 官方支持，页面 + API 一体 |
| 语言 | TypeScript | 全量类型检查 |
| 样式 | Tailwind CSS 4 | 宣纸、墨色、印章红与描金风格 |
| 数据库 | Supabase（免费 Postgres） | 线上免费数据库，含行级安全策略 |
| 表格导出 | ExcelJS | 服务端生成 `.xlsx` 文件 |
| 一言来源 | 一言接口 `v1.hitokoto.cn` | 每日抓取并缓存 |

## 目录结构

```text
zuixiangtang/
├── app/
│   ├── page.tsx                 # 首页
│   ├── league/page.tsx          # 联赛报名页
│   ├── admin/page.tsx           # 首领后台（登录 / 管理）
│   ├── api/                     # 服务端接口
│   │   ├── hitokoto/            # 每日一言
│   │   ├── registrations/       # 报名提交与公开人数统计
│   │   └── admin/               # 登录、退出、管理、导出 Excel
│   ├── icon.svg                 # 网站图标（印章“醉”）
│   └── globals.css              # 全局样式与设计体系
├── components/                  # 页面组件
├── lib/                         # 数据库、会话、限流、一言、Excel 等逻辑
├── public/                      # 静态资源（徽记、水墨图）
├── supabase/schema.sql          # 数据库建表脚本（必读）
├── .env.example                 # 环境变量模板
└── package.json
```

## 一、本地运行（预览）

需要 Node.js 20.9 及以上版本。

```bash
# 1. 安装依赖（npm / pnpm / yarn 均可）
pnpm install

# 2. 复制环境变量模板
cp .env.example .env      # Windows 可直接复制重命名

# 3. 启动开发服务器
pnpm dev
```

浏览器打开 <http://localhost:3000> 即可预览。

> 未配置 Supabase 时，程序自动进入「本地演示模式」：报名数据保存在本机
> 的 `.data` 文件夹中，仅供预览体验；后台会显示提示条。部署上线前请务必
> 按下一节配置线上数据库。

## 二、配置免费线上数据库（Supabase）

1. 打开 <https://supabase.com> 注册并登录。
2. 点击 **New project**，填写项目名（如 `zuixiangtang`），设置数据库
   密码，选择离你最近的区域，创建项目（免费档即可）。
3. 进入项目后，打开左侧 **SQL Editor** → **New query**，
   把本项目 `supabase/schema.sql` 的**全部内容**粘贴进去，点击 **Run**。
   这一步会创建 `registrations`（报名表）和 `hitokoto_cache`（一言缓存表）。
4. 打开左侧 **Project Settings → API Keys**，复制以下三个值：
   - `Project URL`（形如 `https://项目ID.supabase.co`，可在页面右上角
     **Connect** 或左侧 **Integrations → Data API** 页面看到）
     → 填入环境变量 `SUPABASE_URL`
   - `Publishable key`（公开密钥）→ 填入环境变量 `SUPABASE_ANON_KEY`
   - `Secret key`（服务端密钥，点击 **Reveal** 显示）→ 填入环境变量
     `SUPABASE_SERVICE_ROLE_KEY`

## 三、环境变量说明

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `SUPABASE_URL` | 线上必填 | Supabase 项目地址 |
| `SUPABASE_ANON_KEY` | 线上必填 | Publishable key 公开密钥（成员端读写用） |
| `SUPABASE_SERVICE_ROLE_KEY` | 线上必填 | Secret key 服务端密钥（删除记录、写缓存用，**绝不可泄露到前端**） |
| `ADMIN_USERNAME` | 建议设置 | 首领登录用户名，默认「首领」 |
| `ADMIN_PASSWORD` | 必填 | 首领登录密码，务必改成强密码 |
| `SESSION_SECRET` | 建议设置 | 会话签名密钥，任意 64 位随机字符串 |
| `NEXT_PUBLIC_SITE_URL` | 可选 | 站点完整地址，用于生成 sitemap |

生成随机密钥示例：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 四、部署到 GitHub 与 Vercel

### 1. 上传到 GitHub

```bash
git init
git add .
git commit -m "醉乡堂部落官网：联赛报名与首领后台"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> 仓库中**不要提交** `.env` 文件（已写入 `.gitignore`），
> 密钥一律通过 Vercel 的环境变量注入。

### 2. 部署到 Vercel

1. 打开 <https://vercel.com>，用 GitHub 账号登录。
2. 点击 **Add New… → Project**，导入刚才的 GitHub 仓库。
3. 框架会自动识别为 Next.js，无需修改构建配置。
4. 展开 **Environment Variables**，把第三节表格中的变量逐个填好
   （`SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`、
   `ADMIN_USERNAME`、`ADMIN_PASSWORD`、`SESSION_SECRET`、
   `NEXT_PUBLIC_SITE_URL`）。
5. 点击 **Deploy**。部署完成后，Vercel 会给出一个 `xxx.vercel.app`
   链接，这就是你的网站地址。

以后每次 `git push`，Vercel 都会自动重新部署。

## 五、首领后台使用说明

1. 打开网站，点击页面右上角（或页脚）的「首领入口」。
2. 输入用户名与密码登录（对应 `ADMIN_USERNAME` / `ADMIN_PASSWORD`）。
3. 登录后可以看到：
   - 报名总人数、已报名人数、暂不参加人数；
   - 全部成员的游戏名称、报名状态、报名时间、更新时间；
   - 「导出 Excel」按钮：下载 `醉乡堂联赛报名_日期.xlsx` 表格；
   - 每条记录右侧的「删除」按钮。
4. 退出：点击右上角「退出登录」。

## 六、每日一言原理

- 首页与 `/api/hitokoto` 会按「中国时区的当天日期」读取数据库缓存；
- 缓存不存在时，向一言接口抓取一次并写回数据库，当天不再重复请求；
- 外部接口超时或数据库不可用时，自动展示内置的古典名句，保证页面可用。

## 七、常见问题

**Q：报名提交提示「读取报名数据失败」？**

多半是忘记执行 `supabase/schema.sql`。到 Supabase 的 SQL Editor 重新运行
一遍建表脚本即可。

**Q：首领登录提示「后台尚未配置管理员密码」？**

检查部署平台的环境变量中是否设置了 `ADMIN_PASSWORD`。

**Q：登录后刷新又回到登录页？**

`SESSION_SECRET` 未设置时，生产环境会在每次重新部署后更换签名密钥，
导致会话失效。请在环境变量中固定设置 `SESSION_SECRET`。

**Q：导出表格里的时间是什么时区？**

统一按中国时区（Asia/Shanghai）格式化显示。

**Q：有人乱填报名怎么办？**

首领可在后台直接删除该记录。系统对提交接口做了频率限制；如需要更严格的
校验，可在成员端增加口令或实名规则。

## 八、安全提示

- `SUPABASE_SERVICE_ROLE_KEY` 只允许出现在服务端环境变量中；
- 请设置强密码作为 `ADMIN_PASSWORD`，并妥善保管；
- `SESSION_SECRET` 请使用随机长字符串，不要使用示例值；
- 数据库已开启行级安全（RLS）：匿名成员只能增、查、改报名记录，
  不能删除；删除能力仅由服务端密钥持有。

## 许可

本项目为「醉乡堂」部落自用网站源码，可自由修改与部署。
