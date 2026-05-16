import type { Instruction } from "@solana/kit";

declare module "@solana/kit" {
  export type IInstruction = Instruction;
}
