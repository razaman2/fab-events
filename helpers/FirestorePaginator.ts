import ArrayPaginator from './ArrayPaginator';

export default class FirestorePaginator extends ArrayPaginator {
  protected async bookmark(control: any) {
    let collection: any = {};

    if (this.pages.length === 0) {
      collection = await this.fetch(this.limit(control));
    } else if (control.page === 1) {
      collection = await this.fetch(this.limit(control).startAt(control.item));
    } else {
      collection = await this.fetch(this.limit(control).startAfter(control.item));
    }

    if (collection.size > 0) {
      if (control !== this.controls.prev) {
        if (this.pages.length === 0) {
          this.pages.push({
            page: control.page, item: collection.docs[0], size: control.size
          });
        }
        this.pages.push({
          page: (control.page + 1), item: collection.docs[(collection.docs.length - 1)], size: control.size
        });
      } else {
        if (this.pages.length > 2) {
          this.pages.pop();
        }
      }
      this.controls = {
        prev: this.pageExists(3) ? this.pages[this.getPage(3)] : this.pages[0],
        next: this.pageExists(1) ? this.pages[this.getPage(1)] : this.pages[0]
      };
      this.controller.page = control.page;
    } else {
      if (this.pages[this.getPage(1)]) {
        this.controls = {
          prev: this.pages[this.getPage(2)],
          next: this.pages[this.getPage(1)]
        };
        this.pages.push(false);
      }
    }

    return collection;
  }

  protected limit(control: any) {
    return (control.size > 0) ? this.source.limit(control.size) : this.source;
  }

  protected fetch(query: any) {
    return new Promise(async (resolve) => {
      this.controller.listener();
      this.controller.busy = true;
      resolve(await this.callback(query));
      this.controller.busy = false;
    });
  }
}
