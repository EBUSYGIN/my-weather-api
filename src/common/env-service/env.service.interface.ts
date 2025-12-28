export interface IEnvService {
  get: (key: string) => string | undefined;
  getPort: () => number | undefined;
}
