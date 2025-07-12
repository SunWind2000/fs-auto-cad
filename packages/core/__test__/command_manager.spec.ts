import { describe, it, expect } from "vitest";
import { FSApp } from "../src";

describe("Command Manager Tests", () => {
    it("should register and execute a command", () => {
        const mgr = new FSApp.Command.CommandManager();
        mgr.register("testCommand", class extends FSApp.Command.Command {
            onExecute() {
                console.log("Test command executed");
            }
        });

        expect(mgr.hasRegistered("testCommand")).toBe(true);
        mgr.execute("testCommand");
    });

    it("should handle command history", () => {
        const mgr = new FSApp.Command.CommandManager();
        mgr.register("testCommand", class extends FSApp.Command.Command {
            onExecute(arg1: number, arg2: number) {
                console.log("Test command executed");
                expect(arg1).toBe(1);
                expect(arg2).toBe(2);
            }
        });

        mgr.execute("testCommand", 1, 2);
        expect(mgr.canUndo).toBe(true);
        mgr.undo();
        expect(mgr.canRedo).toBe(true);
        mgr.redo();
        console.log(mgr.readLog());
    });

    it("should handle command cleanup and completion", () => {
        const mgr = new FSApp.Command.CommandManager();
        mgr.register("testCommand", class extends FSApp.Command.Command {

            public get autoComplete(): boolean {
                return false; // 不自动结束命令
            }

            onExecute() {
                console.log("Test command executed");
                this.cancel();
            }

            onCleanup() {
                console.log("Command cleaned up");
            }

            onComplete() {
                expect(this.name).toBe("testCommand");
                console.log("Command completed");
            }

            onCancel() {
                expect(this.name).toBe("testCommand");
                console.log("Command cancelled");
            }
        });

        mgr.execute("testCommand");
    });
});
