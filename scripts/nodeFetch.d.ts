export declare const nodeFetch: (
  url: string,
  config?: { method?: string; unsafe?: boolean; http2Stream?: boolean; body?: any; headers?: { [key: string]: value } }
) => Promise<{ body: any; headers: { [key: string]: value }; rawHeaders: string[]; status: number }>
