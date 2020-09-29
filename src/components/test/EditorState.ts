export default class EditorState {
    private content: string = '';

    public constructor(content: string) {
        this.content = content;
    }

    public getContent() {
        return this.content;
    }
}
