import { createParser } from 'eventsource-parser';
import { flushSync } from 'react-dom';

type ImagePayload = { type?: string; b64_json?: string; error?: { message?: string } };

export async function streamImage(
  endpoint: string,
  input: Record<string, unknown>,
  onFrame: (dataUrl: string, isFinal: boolean) => void,
  headers?: HeadersInit,
): Promise<void> {
  const send = (stream: boolean) => fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...Object.fromEntries(new Headers(headers).entries()) },
    body: JSON.stringify({ ...input, stream }),
  });
  const res = await send(true);
  if (!res.ok || !res.body) {
    const body = await res.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message || `Não foi possível gerar a capa (${res.status}).`);
  }
  let sawCompleted = false;
  let sawAnyEvent = false;
  let streamError: string | undefined;
  const parser = createParser({ onEvent(event) {
    let payload: ImagePayload | undefined;
    try { payload = JSON.parse(event.data) as ImagePayload; } catch { payload = undefined; }
    if (event.event === 'error' || payload?.type === 'error') {
      sawAnyEvent = true;
      streamError = payload?.error?.message ?? 'Não foi possível gerar a capa.';
      return;
    }
    const type = event.event || payload?.type;
    if (type !== 'image_generation.partial_image' && type !== 'image_generation.completed') return;
    sawAnyEvent = true;
    if (!payload?.b64_json) { streamError = 'A IA não retornou uma imagem.'; return; }
    const isFinal = type === 'image_generation.completed';
    flushSync(() => onFrame(`data:image/png;base64,${payload?.b64_json}`, isFinal));
    if (isFinal) sawCompleted = true;
  }});
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  try {
    while (true) {
      let chunk: ReadableStreamReadResult<string>;
      try { chunk = await reader.read(); } catch (error) { if (sawAnyEvent) throw error; break; }
      if (chunk.done) break;
      parser.feed(chunk.value);
    }
  } finally { await reader.cancel().catch(() => {}); }
  if (streamError) throw new Error(streamError);
  if (!sawAnyEvent) {
    const replay = await send(false);
    const json = await replay.json().catch(() => null) as { data?: { b64_json?: string }[]; error?: { message?: string }; message?: string } | null;
    if (!replay.ok) throw new Error(json?.error?.message || json?.message || `Não foi possível gerar a capa (${replay.status}).`);
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) throw new Error('A IA não retornou uma imagem.');
    onFrame(`data:image/png;base64,${b64}`, true);
    return;
  }
  if (!sawCompleted) throw new Error('A geração terminou sem concluir a imagem.');
}