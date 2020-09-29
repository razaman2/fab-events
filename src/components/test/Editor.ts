import History
    from "components/test/History";
import EditorState
    from "components/test/EditorState";

export default class Editor {
    private content: string = '';

    public constructor(private history: History) {
    }

    public createState(content: string) {
        return this.history.push(new EditorState(content));
    }

    public restore() {
        const state = this.history.pop();

        if (state) {
            this.setContent(state.getContent());
        }
    }

    public setContent(content: string) {
        this.content = content;
    }

    public getContent() {
        return this.content;
    }

    public isEmptyHistory() {
        return this.history.empty();
    }
}
