export default class ArrayPaginator {
  protected controls: any = {};

  protected pages: Array<any> = [];

  protected callback = (query: any) => {
    return query.get();
  };

  protected controller: any = {
    busy: false,
    size: 0,
    listener: () => {}
  };

  constructor(protected source: any, controller?: any) {
    if (controller) {
      this.controller = this.syncController(controller);
    }
  }

  protected syncController(controller: any) {
    const entries = Object.entries(this.controller);
    return entries.reduce((controller, [key, value]) => {
      if (!controller.hasOwnProperty(key)) {
        controller[key] = value;
      }
      return controller;
    }, controller);
  }

  public get(size = 0, callback = this.callback) {
    this.callback = callback;

    if (typeof this.controller.size === 'function') {
      this.controller[this.controller.size.call()] = size;
    } else {
      this.controller.size = size;
    }

    return this.bookmark({size, ...this.reset().controls.next});
  }

  public next() {
    return this.bookmark(this.controls.next);
  }

  public prev() {
    return this.bookmark(this.controls.prev);
  }

  protected bookmark(control: any) {
    const chunk = this.source.slice(control.item, (control.size + control.item));

    if (control.page === 1) {
      this.pages.push({size: control.size, page: control.page, item: control.item});
    }

    if (chunk.length > 0) {
      if (control !== this.controls.prev) {
        if (!this.pageExists((control.page + 1))) {
          this.pages.push({size: control.size, page: (control.page + 1), item: (control.item + control.size)});
        }
        this.controls = {
          prev: this.pages[(this.pages.length - 2)],
          next: this.pages[(this.pages.length - 1)]
        };
      } else {
        const index = this.pages.findIndex((control) => {
          return this.controls.prev === control;
        });
        this.controls = {
          prev: this.pages[(index === 0) ? index : (index - 1)],
          next: this.pages[index]
        };
      }
    }

    return chunk;
  }

  protected reset() {
    this.pages = [];
    this.controls = {
      prev: {page: 1, item: 0},
      next: {page: 1, item: 0}
    };
    return this;
  }

  protected pageExists(offset: number) {
    return (this.pages[(this.pages.length - offset)] !== undefined)
  }

  protected getPage(offset: number) {
    return (this.pages.length - offset);
  }
}
