export interface IntroModuleInput {
  id?: string;
  title: string;
  items: string;
  note: string;
}

export const DEFAULT_INTRO_MODULES: IntroModuleInput[] = [
  {
    title: "部落活动",
    items: "部落战 · 联赛 · 竞赛\n十级都城",
    note: "有奶🍼 兼顾休闲娱乐",
  },
  {
    title: "晋升之阶",
    items: "捐兵一千 · 长老\n捐兵两千 · 副首",
    note: "",
  },
  {
    title: "奖励机制",
    items: "竞赛第一：5 元 🧧\n联赛第一：8.88",
    note: "并列第一看捐兵数与活跃度",
  },
  {
    title: "职位增幅",
    items: "长老：奖励增幅 0.05\n副首：奖励增幅 0.25",
    note: "仅群成员有效",
  },
  {
    title: "联赛纪律",
    items: "挂绿牌未打、乱打者\n有职位降职 · 无职位 ✈",
    note: "",
  },
];

export const INTRO_MODULE_LIMITS = {
  maxModules: 20,
  maxTitle: 30,
  maxItems: 600,
  maxNote: 120,
};
