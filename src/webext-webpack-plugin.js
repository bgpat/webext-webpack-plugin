import path from "path";
import webExt from "web-ext";

class WebExtPlugin {
  constructor(params = {}, options = {}) {
    this.params = {
      sourceDir: process.cwd(),
      artifactsDir: path.join(process.cwd(), "web-ext-artifacts"),
      noReload: true,
      ...params
    };
    this.options = {
      shouldExitProgram: true,
      ...options
    };
    this.watch = false;
  }

  apply(compiler) {
    compiler.hooks.watchRun.tap(this.name, () => (this.watch = true));
    compiler.hooks.watchClose.tap(this.name, () => this.close());
    compiler.hooks.done.tapPromise(this.name, () => {
      return this.watch
        ? this.runner
          ? this.reload()
          : this.run()
        : this.build();
    });
  }

  get name() {
    return "WebExtPlugin";
  }

  run() {
    return webExt.cmd.run(this.params, this.options).then(runner => {
      this.runner = runner;
    });
  }

  build() {
    return webExt.cmd.build(this.params, this.options);
  }

  reload() {
    return this.runner.reloadAllExtensions();
  }

  close() {
    if (this.runner) {
      this.runner.exit();
    }
  }
}

module.exports = WebExtPlugin;
