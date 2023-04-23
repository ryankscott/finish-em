declare module "chrono-node" {
    export function parse(inp: string): { text: string, index: number, ref: Date }[]
}
