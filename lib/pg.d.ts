declare module 'pg' {
  export interface PoolConfig {
    connectionString?: string;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }

  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    query(text: string, params?: any[]): Promise<QueryResult>;
    connect(): Promise<any>;
    on(event: string, listener: (err: Error) => void): void;
  }
}
