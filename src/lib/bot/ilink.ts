const ILINK_BASE = 'https://ilinkai.weixin.qq.com';

function randomUin(): string {
  const uin = Math.floor(Math.random() * 4294967295) + 1;
  return Buffer.from(String(uin)).toString('base64');
}

function headers(token: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    AuthorizationType: 'ilink_bot_token',
    Authorization: `Bearer ${token}`,
    'X-WECHAT-UIN': randomUin(),
  };
}

interface WeixinMessage {
  msg_id?: string;
  to_user_id?: string;
  from_user_id?: string;
  context_token?: string;
  message_type?: number;
  item_list?: Array<{
    type?: number;
    text_item?: { text?: string };
  }>;
}

interface GetUpdatesResponse {
  ret: number;
  msgs?: WeixinMessage[];
  get_updates_buf?: string;
}

export interface ParsedMessage {
  text: string;
  toUserId: string;
  fromUserId: string;
  contextToken: string;
}

export async function pollUpdates(
  token: string,
  cursor: string
): Promise<{ messages: ParsedMessage[]; newCursor: string }> {
  const res = await fetch(`${ILINK_BASE}/ilink/bot/getupdates`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      get_updates_buf: cursor,
      base_info: { channel_version: '1.0.2' },
    }),
    signal: AbortSignal.timeout(10000),
  });

  const json: GetUpdatesResponse = await res.json();
  if (json.ret !== 0) return { messages: [], newCursor: cursor };

  const messages: ParsedMessage[] = [];
  for (const msg of json.msgs ?? []) {
    const text = msg.item_list
      ?.map((item) => item.text_item?.text ?? '')
      .join('') ?? '';
    if (text && msg.context_token && msg.from_user_id) {
      messages.push({
        text: text.trim(),
        toUserId: msg.from_user_id,
        fromUserId: msg.to_user_id ?? '',
        contextToken: msg.context_token,
      });
    }
  }

  return { messages, newCursor: json.get_updates_buf ?? cursor };
}

export async function sendReply(
  token: string,
  toUserId: string,
  contextToken: string,
  text: string
): Promise<boolean> {
  const res = await fetch(`${ILINK_BASE}/ilink/bot/sendmessage`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({
      msg: {
        to_user_id: toUserId,
        client_id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        message_type: 2,
        message_state: 2,
        context_token: contextToken,
        item_list: [{ type: 1, text_item: { text } }],
      },
      base_info: { channel_version: '1.0.2' },
    }),
  });

  const json = await res.json();
  return json.ret === 0;
}
