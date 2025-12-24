declare function directory(): Promise<string>;
declare function typescript(): Promise<boolean>;
declare function example(): Promise<boolean>;
declare function gitInit(): Promise<boolean>;
declare function installDependencies(packageManager: string): Promise<boolean>;
declare function enableABTests(): Promise<boolean>;
export { directory, typescript, example, gitInit, installDependencies, enableABTests };
//# sourceMappingURL=prompts.d.ts.map