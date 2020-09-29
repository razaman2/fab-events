import EditorState
    from "components/test/EditorState";

export default class History {
    private states: Array<EditorState> = [];

    public push(state: EditorState) {
        this.states.push(state);
    }

    public pop() {
        return this.states.pop();
    }

    public empty() {
        return this.states.length < 1;
    }
}
