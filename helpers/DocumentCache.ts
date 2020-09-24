export default class DocumentCache {
    public constructor(protected collection: () => Array<any>) {
    }

    protected documents: Array<any> = [];

    public async getDocuments(params: { search: (item: any) => { for: string, equals: any }, relationship: (id: string) => any }) {
        const promises = this.collection().reduce((uids: Array<string>, item) => {
            const data = params.search(item);
            // Determine if the relationship listed on the note needs to be fetched.
            // If the relationship was already fetched, we don't need to fetch again.
            if (data && !this.isRelationshipLoaded(data) && !uids.includes(data.equals)) {
                uids.push(data.equals);
            }

            return uids;
        }, []).map((id: string) => params.relationship(id));

        return Object.assign(this.documents, await Promise.all(promises));
    }

    protected isRelationshipLoaded(data: { for: string, equals: any }) {
        return this.documents.find((relationship) => {
            return ((relationship[data.hasOwnProperty(data.for) ? data.for : 'id']) === data.equals);
        });
    }
}
