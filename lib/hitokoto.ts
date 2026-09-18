import { getHitokotoCache, saveHitokotoCache } from "@/lib/storage";

const FALLBACK_LINES: { text: string; from: string }[] = [
  { text: "长风破浪会有时，直挂云帆济沧海。", from: "李白 · 行路难" },
  { text: "会当凌绝顶，一览众山小。", from: "杜甫 · 望岳" },
  { text: "海内存知己，天涯若比邻。", from: "王勃 · 送杜少府之任蜀州" },
  { text: "仰天大笑出门去，我辈岂是蓬蒿人。", from: "李白 · 南陵别儿童入京" },
  { text: "人生得意须尽欢，莫使金樽空对月。", from: "李白 · 将进酒" },
  { text: "山重水复疑无路，柳暗花明又一村。", from: "陆游 · 游山西村" },
  { text: "莫愁前路无知己，天下谁人不识君。", from: "高适 · 别董大" },
  { text: "采菊东篱下，悠然见南山。", from: "陶渊明 · 饮酒" },
  { text: "千磨万击还坚劲，任尔东西南北风。", from: "郑燮 · 竹石" },
  { text: "大鹏一日同风起，扶摇直上九万里。", from: "李白 · 上李邕" },
  { text: "不畏浮云遮望眼，自缘身在最高层。", from: "王安石 · 登飞来峰" },
  { text: "千淘万漉虽辛苦，吹尽狂沙始到金。", from: "刘禹锡 · 浪淘沙" },
];

/** 以中国时区（Asia/Shanghai）计算今天日期，格式 YYYY-MM-DD。 */
export function shanghaiDate(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function fetchRemoteHitokoto(): Promise<{ text: string; from: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(
      "https://v1.hitokoto.cn/?c=a&c=d&c=i&c=k&encode=json",
      // force-cache：配合首页 revalidate=3600 做小时级增量刷新；
      // 数据库缓存决定“每天只抓取一次”，此处缓存仅用于构建期与降级场景。
      { signal: controller.signal, cache: "force-cache" }
    );
    if (!response.ok) {
      throw new Error(`hitokoto service responded ${response.status}`);
    }
    const data = (await response.json()) as {
      hitokoto?: unknown;
      from_who?: unknown;
      from?: unknown;
    };
    const text =
      typeof data.hitokoto === "string" ? data.hitokoto.trim() : "";
    if (!text) throw new Error("empty hitokoto");
    const from =
      (typeof data.from_who === "string" && data.from_who.trim()) ||
      (typeof data.from === "string" && data.from.trim()) ||
      "一言";
    return { text, from };
  } finally {
    clearTimeout(timer);
  }
}

function fallbackFor(date: string): { text: string; from: string } {
  let hash = 0;
  for (const char of date) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return FALLBACK_LINES[hash % FALLBACK_LINES.length];
}

export interface DailyHitokoto {
  text: string;
  from: string;
  date: string;
}

/**
 * 每天抓取一句“一言”：优先读数据库缓存，缓存缺失时请求一言接口并写回。
 * 任一环节失败时使用内置的古典名句兜底，保证首页永远有内容。
 */
export async function getDailyHitokoto(): Promise<DailyHitokoto> {
  const date = shanghaiDate();
  try {
    const cached = await getHitokotoCache(date);
    if (cached && cached.text) {
      return { ...cached, date };
    }
  } catch (error) {
    console.error("[hitokoto] 读取缓存失败：", error);
  }

  try {
    const remote = await fetchRemoteHitokoto();
    try {
      await saveHitokotoCache(date, remote.text, remote.from);
    } catch (error) {
      console.error("[hitokoto] 写入缓存失败：", error);
    }
    return { ...remote, date };
  } catch (error) {
    console.error("[hitokoto] 抓取失败，使用内置名句：", error);
  }

  return { ...fallbackFor(date), date };
}
