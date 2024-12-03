import type { Context } from "hono";

// Context
export type ListContext = Context;

// 榜单数据
export interface ListItem {
  id: number | string;
  title: string;
  cover?: string;
  author?: string;
  desc?: string;
  hot: number | undefined;
  timestamp: number | undefined;
  url: string;
  mobileUrl: string;
}

// 路由接口数据
export interface RouterResType {
  updateTime: string;
  fromCache: boolean;
  data: ListItem[];
}

// 路由数据
export interface RouterData extends RouterResType {
  name: string;
  title: string;
  type: string;
  description?: string;
  params?: Record<string, string | object>;
  total: number;
  link?: string;
}

// 请求类型
export interface Get {
  url: string;
  headers?: Record<string, string | string[]>;
  params?: Record<string, string | number>;
  timeout?: number;
  noCache?: boolean;
  ttl?: number;
  originaInfo?: boolean;
}

export interface Post {
  url: string;
  headers?: Record<string, string | string[]>;
  body?: string | object | Buffer | undefined;
  timeout?: number;
  noCache?: boolean;
  ttl?: number;
  originaInfo?: boolean;
}

export interface Web {
  url: string;
  timeout?: number;
  noCache?: boolean;
  ttl?: number;
  userAgent?: string;
}

// 参数类型
export interface Options {
  [key: string]: string | number | undefined;
}
