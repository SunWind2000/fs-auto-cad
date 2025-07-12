/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect } from "vitest";
import { FSApp } from "../src";

describe("Command Manager Tests", () => {
    it("should register and execute a command", () => {
        const mgr = new FSApp.Command.CommandManager();
        mgr.register("testCommand1", class extends FSApp.Command.Command {
            onExecute() {
                console.log("Test command executed");
            }
        });

        expect(mgr.hasRegistered("testCommand1")).toBe(true);
        mgr.execute("testCommand1");
    });

    it("should handle command history", () => {
        const mgr = new FSApp.Command.CommandManager();
        mgr.register("testCommand2", class extends FSApp.Command.Command {
            onExecute(arg1: number, arg2: number) {
                console.log("Test command executed");
                expect(arg1).toBe(1);
                expect(arg2).toBe(2);
            }
        });

        mgr.execute("testCommand2", 1, 2);
        expect(mgr.history.canUndo).toBe(true);
        mgr.history.undo();
        expect(mgr.history.canRedo).toBe(true);
        mgr.history.redo();
        mgr.setLogLevel(FSApp.Command.LogLevelEnum.DETAILED);
        console.log(mgr.history.logList);
    });

    it("should handle command cleanup and completion", () => {
        const mgr = new FSApp.Command.CommandManager();
        mgr.register("testCommand3", class extends FSApp.Command.Command {

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
                expect(this.name).toBe("testCommand3");
                console.log("Command completed");
            }

            onCancel() {
                expect(this.name).toBe("testCommand3");
                console.log("Command cancelled");
            }
        });

        mgr.execute("testCommand3");
    });

    it("should filter logs by level", () => {
        const mgr = new FSApp.Command.CommandManager();
        mgr.setLogLevel(FSApp.Command.LogLevelEnum.SIMPLE);
        mgr.register("testCommand4", class extends FSApp.Command.Command {
            onExecute() {
                this._mgr?.writeLog(FSApp.Command.LogTypeEnum.WARN, "Test command executed");
            }
        });

        mgr.execute("testCommand4");
        const logs = mgr.history.logList;
        expect(logs.length).toBe(0); // SIMPLE level should not include WARN logs
        mgr.setLogLevel(FSApp.Command.LogLevelEnum.NORMAL);
        const logsNormal = mgr.history.logList;
        expect(logsNormal.length).toBe(1); // NORMAL level should include WARN logs
        mgr.setLogLevel(FSApp.Command.LogLevelEnum.DETAILED);
        const logsDetailed = mgr.history.logList;
        expect(logsDetailed.length).toBeGreaterThan(1); // DETAILED level should also include WARN logs
    });

    it("should be registered by decorator", () => {
        @FSApp.Command.registerCmd("testCommand5")
        class TestCommand5 extends FSApp.Command.Command {
            onExecute() {
                console.log("Test command 5 executed");
            }
        }

        @FSApp.Command.registerCmd("testCommand6")
        class TestCommand6 extends FSApp.Command.Command {
            onExecute() {
                console.log("Test command 6 executed");
            }
        }

        const mgr = FSApp.Command.CommandManager.getInstance();
        expect(mgr.hasRegistered("testCommand5")).toBe(true);
        expect(mgr.hasRegistered("testCommand6")).toBe(true);
        console.log(mgr);
        mgr.execute("testCommand5");
    });
});
