const BANNED_WORDS = [
  "傻逼",
  "傻比",
  "煞笔",
  "傻叉",
  "沙雕",
  "脑残",
  "白痴",
  "智障",
  "弱智",
  "废物",
  "垃圾玩意",
  "草泥马",
  "草你妈",
  "操你妈",
  "艹你妈",
  "操你",
  "艹你",
  "干你娘",
  "干你妈",
  "日你妈",
  "日你",
  "你妈的",
  "他妈的",
  "妈逼",
  "你妈逼",
  "狗日的",
  "狗东西",
  "狗娘养",
  "王八蛋",
  "混蛋",
  "滚蛋",
  "滚你",
  "贱人",
  "贱货",
  "婊子",
  "骚货",
  "鸡巴",
  "二逼",
  "傻吊",
  "神经病",
  "变态",
  "去死",
  "死全家",
  "不得好死",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "motherfucker",
  "nmsl",
  "cnm",
  "tmd",
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 将常见骂人词汇替换为 **，返回处理后的文本与是否命中标记。 */
export function maskProfanity(text: string): { text: string; masked: boolean } {
  let output = text;
  let masked = false;
  for (const word of BANNED_WORDS) {
    const pattern = new RegExp(escapeRegExp(word), "gi");
    if (pattern.test(output)) {
      output = output.replace(pattern, "**");
      masked = true;
    }
  }
  return { text: output, masked };
}
